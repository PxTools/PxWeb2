import { i18n } from 'i18next';
import React, { createContext, useEffect, useState, ReactNode } from 'react';

import useVariables from './useVariables';
import {
  Dataset,
  OutputFormatType,
  TableService,
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import {
  PxTable,
  PxTableMetadata,
  getPxTableData,
  setPxTableData,
} from '@pxweb2/pxweb2-ui';
import { mapJsonStat2Response } from '../../mappers/JsonStat2ResponseMapper';

// Define types for the context state and provider props
export interface TableDataContextType {
  isInitialized: boolean;
  data: PxTable | undefined;
  /*   loading: boolean;
  error: string | null; */
  fetchTableData: (tableId: string, i18n: i18n, isMobile: boolean) => void;
  pivotToMobile: () => void;
  pivotToDesktop: () => void;
  pivotCW: () => void;
}

interface TableDataProviderProps {
  children: ReactNode;
}

// Create context with default values
const TableDataContext = createContext<TableDataContextType | undefined>({
  isInitialized: false,
  data: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchTableData: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pivotToMobile: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pivotToDesktop: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  pivotCW: () => {},
});

const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  const [isInitialized] = useState(true);
  // Data (metadata) that reflects variables and values selected by user right now. Used as data source for the table
  const [data, setData] = useState<PxTable | undefined>(undefined);
  // Accumulated data (and metadata) from all API calls made by user. Stored in the data cube.
  const [accumulatedData, setAccumulatedData] = useState<PxTable | undefined>(
    undefined,
  );

  // State for mobile mode. If mobile mode data will be pivoted so that all variables are in the stub.
  const [isMobileMode, setIsMobileMode] = useState<boolean>(false);

  // Variables in the stub (desktop table)
  const [stubDesktop, setStubDesktop] = useState<string[]>([]);
  // Variables in the heading (desktop table)
  const [headingDesktop, setHeadingDesktop] = useState<string[]>([]);

  // Variables in the stub (mobile table)
  const [stubMobile, setStubMobile] = useState<string[]>([]);
  // Variables in the heading (mobile table)
  const [headingMobile, setHeadingMobile] = useState<string[]>([]);

  const [errorMsg, setErrorMsg] = useState('');
  const variables = useVariables();

  useEffect(() => {
    if (errorMsg !== '') {
      console.error('ERROR: TableDataProvider:', errorMsg);
    }
  }, [errorMsg]);

  /**
   * Fetches table data from the API (or from accumulated data in the data cube if possible).
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   */
  const fetchTableData = async (
    tableId: string,
    i18n: i18n,
    isMobile: boolean,
  ) => {
    try {
      const selections: Array<VariableSelection> = [];

      // Get selection from Selection provider
      const ids = variables.getUniqueIds();
      ids.forEach((id) => {
        const selectedCodeList = variables.getSelectedCodelistById(id);
        const selection: VariableSelection = {
          variableCode: id,
          valueCodes: variables.getSelectedValuesByIdSorted(id),
        };

        // Add selected codelist to selection if it exists
        if (selectedCodeList) {
          selection.codeList = selectedCodeList;
        }

        selections.push(selection);
      });

      const variablesSelection: VariablesSelection = { selection: selections };

      // Check if we have accumulated data in the data cube and if it is valid. If not we cannot use it.
      const validAccData: boolean = isAccumulatedDataValid(
        variablesSelection,
        i18n.language,
        tableId,
      );

      if (validAccData) {
        await fetchWithValidAccData(
          tableId,
          i18n,
          isMobile,
          variablesSelection,
        );
      } else {
        await fetchWithoutValidAccData(
          tableId,
          i18n,
          isMobile,
          variablesSelection,
        );
      }

      if (isMobile && !isMobileMode) {
        setIsMobileMode(true);
      }
      if (!isMobile && isMobileMode) {
        setIsMobileMode(false);
      }
    } catch (error: unknown) {
      const err = error as Error;

      setErrorMsg(
        'Failed to fetch table data. Please try again later. ' + err.message,
      );
    }
  };

  /**
   * Fetch data. We DO NOT have valid accumulated data in the data cube.
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param variablesSelection - User selection of variables and their values.
   */
  const fetchWithoutValidAccData = async (
    tableId: string,
    i18n: i18n,
    isMobile: boolean,
    variablesSelection: VariablesSelection,
  ) => {
    const pxTable: PxTable = await fetchFromApi(
      tableId,
      i18n,
      variablesSelection,
    );

    initializeStubAndHeading(pxTable, isMobile);
    setData(pxTable);

    // Store as accumulated data
    setAccumulatedData(structuredClone(pxTable));
  };

  /**
   * Fetch data. We DO have valid accumulated data in the data cube.
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param variablesSelection - User selection of variables and their values.
   */
  const fetchWithValidAccData = async (
    tableId: string,
    i18n: i18n,
    isMobile: boolean,
    variablesSelection: VariablesSelection,
  ) => {
    // Check if all data and metadata asked for by the user is already loaded from earlier API-calls

    // VariablesSelection for the data that is not already loaded in accumulatedData
    let notLoadedVarSelection: VariablesSelection = { selection: [] };

    if (isAllDataAlreadyLoaded(variablesSelection, notLoadedVarSelection)) {
      // All data and metadata asked for by the user is already loaded in accumulatedData. No need for a new API-call. Create a pxTable from accumulatedData instead.
      const pxTable = createPxTableFromAccumulatedData(variablesSelection);

      if (pxTable) {
        if (isMobile) {
          pivotForMobile(pxTable);
        } else {
          pivotForDesktop(pxTable);
        }

        setData(pxTable);
        return;
      }
    }

    // Get the right codelists for the variables
    notLoadedVarSelection.selection.forEach((diffSelection) => {
      const selection = variablesSelection.selection.find(
        (sel) => sel.variableCode === diffSelection.variableCode,
      );
      if (selection?.codeList) {
        diffSelection.codeList = selection.codeList;
      }
    });

    // Get the not already loaded data from the API
    let pxTable: PxTable = await fetchFromApi(
      tableId,
      i18n,
      notLoadedVarSelection,
    );

    // Merge pxTable with accumulatedData
    mergeWithAccumulatedData(
      pxTable,
      notLoadedVarSelection,
      variablesSelection,
    );
    const pxTableMerged = createPxTableFromAccumulatedData(variablesSelection);
    if (pxTableMerged) {
      pxTable = pxTableMerged;
    }

    if (isMobile) {
      pivotForMobile(pxTable);
    } else {
      pivotForDesktop(pxTable);
    }

    setData(pxTable);
  };

  /**
   * Make a call to the API to fetch table data
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param variablesSelection - User selection of variables and their values.
   * @returns A PxTable object with the data and metadata.
   */
  const fetchFromApi = async (
    tableId: string,
    i18n: i18n,
    variablesSelection: VariablesSelection,
  ) => {
    const res = await TableService.getTableDataByPost(
      tableId,
      i18n.language,
      OutputFormatType.JSON_STAT2,
      undefined,
      variablesSelection,
    );

    // Map response to json-stat2 Dataset
    const pxDataobj: unknown = res;
    const pxTabData = pxDataobj as Dataset;

    const pxTable: PxTable = mapJsonStat2Response(pxTabData);

    return pxTable;
  };

  /**
   * Checks if the accumulated data is valid.
   * @param variablesSelection - User selection of variables and their values.
   * @param language - Language of the current request.
   * @returns `true` if the accumulated data is valid, `false` otherwise.
   */
  function isAccumulatedDataValid(
    variablesSelection: VariablesSelection,
    language: string,
    tableId: string,
  ): boolean {
    // accumulatedData must exist
    if (accumulatedData === undefined) {
      return false;
    }

    // accumulatedData must be in the right language
    if (
      accumulatedData.metadata.language.toLowerCase() !== language.toLowerCase()
    ) {
      return false;
    }

    // accumulatedData must be from the same table
    if (accumulatedData.metadata.id.toLowerCase() !== tableId.toLowerCase()) {
      return false;
    }

    // Check that the dimensions are the same in accumulatedData and variablesSelection.
    // The variables must be the same and they must all have at least one value
    if (
      variablesSelection.selection.length !==
      accumulatedData.metadata.variables.length
    ) {
      return false;
    }

    // Check if any variable has an empty or undefined valueCodes array
    for (const selection of variablesSelection.selection) {
      if (!selection.valueCodes || selection.valueCodes.length === 0) {
        return false;
      }
    }

    for (const selection of variablesSelection.selection) {
      // Check that the variable exists in accumulatedData
      const variable = accumulatedData.metadata.variables.find(
        (variable) => variable.id === selection.variableCode,
      );
      if (!variable) {
        return false;
      }
      // We need to check that the variable codelist has not been changed
      // else {
      //   if (selection.codeList) {
      //     if (variable.codeList !== selection.codeList) {
      //       return false;
      //     }
      //   }
      // }
    }

    return true;
  }

  /**
   * Checks if all data and metadata the user asks for is already loaded in the accumulated data.
   * If there are missing datacells in the accumulated data, the missing variables and values are added to the notLoadedVarSelection.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @param notLoadedVarSelection - Out parameter. After the method has finished notLoadedVarSelection contains the VariablesSelection for the variables and values not already loaded in the accumulated data.
   * @returns `true` if all data the user asks for is already loaded in the accumulated data, `false` otherwise.
   */
  function isAllDataAlreadyLoaded(
    variablesSelection: VariablesSelection,
    notLoadedVarSelection: VariablesSelection,
  ): boolean {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls

      // Dimensions in accumulatedData
      const dimensions: string[] = [];

      checkDataCube(variablesSelection, dimensions, 0, notLoadedVarSelection);
    }

    if (notLoadedVarSelection.selection.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Recursively checks if all data and metadata the user asks for is already loaded in the accumulated data.
   * If there are missing datacells in the accumulated data, the missing variables and values are added to the notLoadedVarSelection.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @param dimensions - An array of dimension values used to navigate through the data cubes.
   * @param dimensionIndex - The current index of the dimension being processed.
   * @param notLoadedVarSelection - Out parameter. After the method has finished notLoadedVarSelection contains the VariablesSelection for the variables and values not already loaded in the accumulated data.
   */
  function checkDataCube(
    variablesSelection: VariablesSelection,
    dimensions: string[],
    dimensionIndex: number,
    notLoadedVarSelection: VariablesSelection,
  ): void {
    if (accumulatedData === undefined) {
      return undefined;
    }

    // 1. Find the variable in the new data that corresponds to the current dimension
    const variableInSelection = variablesSelection.selection.find(
      (varSel) =>
        varSel.variableCode ===
        accumulatedData.metadata.variables[dimensionIndex].id,
    );

    if (variableInSelection) {
      // Has the last dimension been reached? If so we can check if the data from the selection exists in the accumulated data
      if (dimensionIndex === accumulatedData.metadata.variables.length - 1) {
        variableInSelection.valueCodes?.forEach((value) => {
          dimensions[dimensionIndex] = value;

          // Try to get the data value from accumulatedData
          const dataValue = getPxTableData(
            accumulatedData.data.cube,
            dimensions,
          );

          if (dataValue === undefined) {
            // If the data cell does not exist in the accumulated data:
            // --> Add data cell metadata to notLoadedVarSelection (that will be used for API-call to ge the data later)
            addCellMetadataToNotLoadedSelection(
              dimensions,
              notLoadedVarSelection,
            );
          }
        });
      } else {
        // Continue to the next dimension
        variableInSelection.valueCodes?.forEach((value) => {
          dimensions[dimensionIndex] = value;
          checkDataCube(
            variablesSelection,
            dimensions,
            dimensionIndex + 1,
            notLoadedVarSelection,
          );
        });
      }
    }
  }

  /**
   * Adds data cell metadata to the notLoadedVarSelection.
   *
   * @param dimensions - An array of dimension values that identifies the data cell in the data cube.
   * @param notLoadedVarSelection - Contains the VariablesSelection for the variables and values not already loaded in the accumulated data.
   */
  function addCellMetadataToNotLoadedSelection(
    dimensions: string[],
    notLoadedVarSelection: VariablesSelection,
  ): void {
    if (accumulatedData != undefined) {
      dimensions.forEach((dimension, index) => {
        const existingSelection = notLoadedVarSelection.selection.find(
          (sel) =>
            sel.variableCode === accumulatedData.metadata.variables[index].id,
        );
        if (existingSelection) {
          if (!existingSelection.valueCodes?.includes(dimension)) {
            existingSelection.valueCodes?.push(dimension);
          }
        } else {
          notLoadedVarSelection.selection.push({
            variableCode: accumulatedData.metadata.variables[index].id,
            valueCodes: [dimension],
          });
        }
      });
    }
  }

  /**
   * Creates a new PxTable from the accumulated data.
   * NOTE! This function assumes that the accumulated data contains all variables and values selected by the user.
   * In other words: isAllDataAlreadyLoaded() must return true before calling this function.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @returns A new PxTable with the data and metadata from the accumulated data, or `undefined` if the accumulated data is `undefined`.
   */
  function createPxTableFromAccumulatedData(
    variablesSelection: VariablesSelection,
  ): PxTable | undefined {
    if (accumulatedData === undefined) {
      return undefined;
    }

    // Create a deep copy of accumulatedData
    const pxTable: PxTable = structuredClone(accumulatedData);

    // Create a map for quick lookup of selected variable codes and their values
    const selectionMap = new Map(
      variablesSelection.selection.map((selection) => [
        selection.variableCode,
        new Set(selection.valueCodes),
      ]),
    );

    // Filter out variables in pxTable that are not present in variablesSelection
    pxTable.metadata.variables = pxTable.metadata.variables.filter((variable) =>
      selectionMap.has(variable.id),
    );

    // Filter out values in each variable that are not present in variablesSelection
    pxTable.metadata.variables.forEach((variable) => {
      const selectedValues = selectionMap.get(variable.id);
      if (selectedValues) {
        variable.values = variable.values.filter((value) =>
          selectedValues.has(value.code),
        );
      } else {
        variable.values = [];
      }
    });

    return pxTable;
  }

  /**
   * Merge pxTable from new API call into the accumulatedData in the data cube. Both data and metadata are merged.
   *
   * @param pxTable - PxTable containing the data and metadata from the new API-call.
   * @param diffVariablesSelection - Variables selection containing only the variables and values not already loaded in the accumulated data.
   * @param variablesSelection - Variables selection containing all variables and values selected by the user.
   */
  function mergeWithAccumulatedData(
    pxTable: PxTable,
    diffVariablesSelection: VariablesSelection,
    variablesSelection: VariablesSelection,
  ): void {
    // Check that it is possible to merge the new data with the accumulated data. If more than one variable changed, it is not possible to merge.
    if (accumulatedData !== undefined) {
      // --- Merge metadata ---

      // Create a map of the variables in accumulated data for quick lookup
      const accDataVariables = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          variable,
        ]),
      );

      diffVariablesSelection.selection.forEach((diffSelection) => {
        // Find the variable in accumulated data that we are going to merge new values into
        if (accDataVariables.has(diffSelection.variableCode)) {
          // The existing variable in accumulated data
          const existingVariable = accDataVariables.get(
            diffSelection.variableCode,
          );

          // Create a map of existing values for the variable for quick lookup
          const existingValues = new Set(
            existingVariable?.values.map((v) => v.code),
          );

          // Find the variable in variablesSelection that we are going to merge new values from
          const selection = variablesSelection.selection.find(
            (sel) => sel.variableCode === diffSelection.variableCode,
          );

          // Find the variable in pxTable (from the new API call) that we are going to merge new values from
          const updatedVariable = pxTable.metadata.variables.find(
            (variable) => variable.id === diffSelection.variableCode,
          )?.values;

          if (updatedVariable) {
            updatedVariable.forEach((value) => {
              if (!existingValues.has(value.code)) {
                // It's a new value that we need to add to the existing variable!
                const newValue = structuredClone(value);

                // Values are assumed to be sorted in the right order in the VariablesProvider
                // Find the index where the new value should be inserted
                const valueIndex = selection?.valueCodes?.indexOf(value.code);
                if (valueIndex !== undefined && valueIndex !== -1) {
                  existingVariable?.values.splice(valueIndex, 0, newValue);
                } else {
                  existingVariable?.values.push(newValue);
                }
              }
            });
          }
        }
      });

      // --- Merge data ---

      // Dimensions in accumulatedData
      const dimensions: string[] = [];

      // Variable order in accumulatedData can be different from the variable order in the new API-call.
      // Because of this we need to create a mapping of the variable order in accumulatedData to the variable order in the new API-call.
      const dimensionsMap: number[] = getDimensionsMap(
        accumulatedData.metadata,
        pxTable.metadata,
      );

      // Update the accumulated data cube with the new data
      updateCube(accumulatedData, pxTable, dimensions, 0, dimensionsMap);
    }
  }

  /**
   * Get dimension mapper for how variables are located in new data vs in accumulated data
   *
   * @param accumulatedMetadata - PxTableMetadata object for the accumulated data.
   * @param newMetadata - PxTableMetadata object for the new data.
   * @returns An array with the index of the variables in the new data.
   */
  function getDimensionsMap(
    accumulatedMetadata: PxTableMetadata,
    newMetadata: PxTableMetadata,
  ): number[] {
    const dimensionsMap: number[] = [];

    for (let i = 0; i < accumulatedMetadata.variables.length; i++) {
      const index = newMetadata.variables.findIndex(
        (variable) => variable.id === accumulatedMetadata.variables[i].id,
      );
      dimensionsMap[i] = index;
    }

    return dimensionsMap;
  }

  /**
   * Updates the accumulated data cube (`accData`) with new data from `newData` based on the specified dimensions.
   *
   * @param accData - The accumulated data cube to be updated.
   * @param newData - The new data cube containing the updated values.
   * @param dimensions - An array of dimension values used to navigate through the data cubes.
   * @param dimensionIndex - The current index of the dimension being processed.
   * @param dimensionsMap - A mapping of dimension indices to their corresponding positions in the dimensions array.
   *
   * This function recursively navigates through the dimensions of the data cubes. For each dimension, it finds the
   * corresponding variable in the new data cube and updates the accumulated data cube with the new values. If the
   * current dimension is the last one, it retrieves the data value from the new data cube and sets it in the
   * accumulated data cube. Otherwise, it continues to the next dimension.
   */
  function updateCube(
    accData: PxTable,
    newData: PxTable,
    dimensions: string[],
    dimensionIndex: number,
    dimensionsMap: number[],
  ): void {
    // 1. Find the variable in the new data that corresponds to the current dimension
    const variableInNewData = newData.metadata.variables.find(
      (variable) =>
        variable.id === accData.metadata.variables[dimensionIndex].id,
    );

    if (variableInNewData) {
      // Has the last dimension been reached? If so we can merge the data from the new data into the accumulated data
      if (dimensionIndex === accData.metadata.variables.length - 1) {
        variableInNewData.values.forEach((value) => {
          dimensions[dimensionIndex] = value.code;

          // Variable order in accumulatedData can be different from the variable order in the new API-call.
          // Because of this we need to create a mapping of the variable order in accumulatedData to the variable order in the new API-call.
          const newDataDimensions: string[] = new Array(
            accData.metadata.variables.length,
          );

          // Do the dimension mapping
          for (let i = 0; i < dimensions.length; i++) {
            const index = dimensionsMap[i];
            newDataDimensions[index] = dimensions[i];
          }

          // Get data value from newData
          const dataValue = getPxTableData(
            newData.data.cube,
            newDataDimensions,
          );

          // Set data in accumulated data cube
          setPxTableData(
            accData.data.cube,
            dimensions,
            structuredClone(dataValue),
          );
        });
      } else {
        // Continue to the next dimension
        variableInNewData.values.forEach((value) => {
          dimensions[dimensionIndex] = value.code;
          updateCube(
            accData,
            newData,
            dimensions,
            dimensionIndex + 1,
            dimensionsMap,
          );
        });
      }
    }
  }

  /**
   * Remember order of variables in stub and heading when table setup is changed.
   *
   * @param pxTable - PxTable containing the data and metadata for display in table.
   * @param isMobile - If the device is mobile or not.
   */
  function initializeStubAndHeading(pxTable: PxTable, isMobile: boolean) {
    if (
      accumulatedData === undefined ||
      accumulatedData.metadata.id !== pxTable.metadata.id
    ) {
      // First time we get data OR we have a new table.

      // -> Set stub and heading order for desktop according to the order in pxTable
      const stubOrderDesktop: string[] = pxTable.stub.map(
        (variable) => variable.id,
      );
      const headingOrderDesktop: string[] = pxTable.heading.map(
        (variable) => variable.id,
      );
      setStubDesktop(stubOrderDesktop);
      setHeadingDesktop(headingOrderDesktop);

      // -> Set stub and heading order for mobile according to the order in pxTable
      const tmpStubMobile = structuredClone(pxTable.stub);
      const tmpHeadingMobile = structuredClone(pxTable.heading);

      tmpHeadingMobile.forEach((variable) => {
        tmpStubMobile.push(variable);
      });

      tmpStubMobile.sort((a, b) => a.values.length - b.values.length);

      const stubOrderMobile: string[] = tmpStubMobile.map(
        (variable) => variable.id,
      );

      const headingOrderMobile: string[] = [];

      setStubMobile(stubOrderMobile);
      setHeadingMobile(headingOrderMobile);

      if (isMobile) {
        pivotTable(pxTable, stubOrderMobile, headingOrderMobile);
      } else {
        pivotTable(pxTable, stubOrderDesktop, headingOrderDesktop);
      }
    } else {
      // Language has changed.

      if (isMobile) {
        pivotTable(pxTable, stubMobile, headingMobile);
      } else {
        pivotTable(pxTable, stubDesktop, headingDesktop);
      }

      // Find all new variables and add them to the stub - Desktop
      const remainingVariables = pxTable.metadata.variables.filter(
        (variable) =>
          !stubDesktop.includes(variable.id) &&
          !headingDesktop.includes(variable.id),
      );

      if (remainingVariables.length > 0) {
        const newStubDesktop = structuredClone(stubDesktop);
        const newStubMobile = structuredClone(stubMobile);

        remainingVariables.forEach((variable) => {
          if (!newStubDesktop.includes(variable.id)) {
            pxTable.stub.push(variable);
            newStubDesktop.push(variable.id);
          }
          if (!newStubMobile.includes(variable.id)) {
            newStubMobile.push(variable.id);
          }
        });
        setStubDesktop(newStubDesktop);
        setStubMobile(newStubMobile);
      }
    }
  }

  /**
   * Pivots the table to mobile layout.
   * This function updates the table structure to fit a mobile layout by adjusting the stub and heading order.
   */
  const pivotToMobile = () => {
    if (data?.heading !== undefined) {
      const tmpTable = structuredClone(data);

      if (tmpTable !== undefined) {
        pivotTable(tmpTable, stubMobile, headingMobile);
        setData(tmpTable);
        setIsMobileMode(true);
      }
    }
  };

  /**
   * Pivots the table to desktop layout.
   * This function updates the table structure to fit a desktop layout by adjusting the stub and heading order.
   */
  const pivotToDesktop = () => {
    if (data?.heading !== undefined) {
      const tmpTable = structuredClone(data);

      if (tmpTable !== undefined) {
        pivotTable(tmpTable, stubDesktop, headingDesktop);
        setData(tmpTable);
        setIsMobileMode(false);
      }
    }
  };

  /**
   * Pivots the table clockwise.
   */
  function pivotCW(): void {
    if (data?.heading === undefined) {
      return;
    }

    const tmpTable = structuredClone(data);
    if (tmpTable === undefined) {
      return;
    }

    let stub: string[];
    let heading: string[];

    if (isMobileMode) {
      stub = structuredClone(stubMobile);
      heading = structuredClone(headingMobile);
    } else {
      stub = structuredClone(stubDesktop);
      heading = structuredClone(headingDesktop);
    }

    if (stub.length === 0 && heading.length === 0) {
      return;
    }

    if (stub.length > 0 && heading.length > 0) {
      stub.push(heading.pop() as string);
      heading.unshift(stub.shift() as string);
    } else if (stub.length === 0) {
      heading.unshift(heading.pop() as string);
    } else if (heading.length === 0) {
      stub.unshift(stub.pop() as string);
    }

    pivotTable(tmpTable, stub, heading);
    setData(tmpTable);

    if (isMobileMode) {
      setStubMobile(stub);
      setHeadingMobile(heading);
    } else {
      setStubDesktop(stub);
      setHeadingDesktop(heading);
    }
  }

  /**
   * Adjusts the table for mobile layout.
   *
   * @param {PxTable} pxTable - The table to be pivoted.
   */
  function pivotForMobile(pxTable: PxTable) {
    pivotTable(pxTable, stubMobile, headingMobile);
  }

  /**
   * Adjusts the table for desktop layout.
   *
   * @param {PxTable} pxTable - The table to be pivoted.
   */
  function pivotForDesktop(pxTable: PxTable) {
    pivotTable(pxTable, stubDesktop, headingDesktop);
  }

  /**
   * Pivots the table according to the stub- and heading order.
   */
  function pivotTable(pxTable: PxTable, stub: string[], heading: string[]) {
    // - pivot pxTable according to stub- and heading order
    pxTable.stub = [];
    stub.forEach((id) => {
      const variable = pxTable.metadata.variables.find(
        (variable) => variable.id === id,
      );
      if (variable) {
        pxTable.stub.push(variable);
      }
    });
    pxTable.heading = [];
    heading.forEach((id) => {
      const variable = pxTable.metadata.variables.find(
        (variable) => variable.id === id,
      );
      if (variable) {
        pxTable.heading.push(variable);
      }
    });
  }

  const memoData = React.useMemo(
    () => ({
      data,
      /* loading, error  */ fetchTableData,
      pivotToMobile,
      pivotToDesktop,
      pivotCW,
      isInitialized,
    }),
    [
      data,
      fetchTableData,
      pivotToMobile,
      pivotToDesktop,
      pivotCW,
      isInitialized,
    ],
  );

  return (
    <TableDataContext.Provider value={memoData}>
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext };
