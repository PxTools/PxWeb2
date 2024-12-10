import { i18n } from 'i18next';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useVariables from './useVariables';
import {
  Dataset,
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
  data: PxTable | undefined;
  /*   loading: boolean;
  error: string | null; */
  fetchTableData: (tableId: string, i18n: i18n) => void;
}

interface TableDataProviderProps {
  children: ReactNode;
}

// Create context with default values
const TableDataContext = createContext<TableDataContextType | undefined>({
  data: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchTableData: () => {},
});

const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  // Data (metadata) that reflects variables and values selected by user right now. Used as data source for the table
  const [data, setData] = useState<PxTable | undefined>(undefined);
  // Accumulated data (and metadata) from all API calls made by user. Stored in the data cube.
  const [accumulatedData, setAccumulatedData] = useState<PxTable | undefined>(
    undefined,
  );

  // Handle with variables are in the stub
  const [stub, setStub] = useState<string[]>([]);
  // Handle with variables are in the heading
  const [heading, setHeading] = useState<string[]>([]);

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
  const fetchTableData = async (tableId: string, i18n: i18n) => {
    const selections: Array<VariableSelection> = [];
    const ids = variables.getUniqueIds();
    ids.forEach((id) => {
      const selection: VariableSelection = {
        variableCode: id,
        valueCodes: variables.getSelectedValuesByIdSorted(id),
      };
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
      fetchWithValidAccData(tableId, i18n, variablesSelection);
    } else {
      fetchWithoutValidAccData(tableId, i18n, variablesSelection);
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
    variablesSelection: VariablesSelection,
  ) => {
    const pxTable: PxTable = await fetchFromApi(
      tableId,
      i18n,
      variablesSelection,
    );

    handleStubAndHeading(pxTable, i18n);
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
    variablesSelection: VariablesSelection,
  ) => {
    // Check if all data and metadata asked for by the user is already loaded from earlier API-calls
    if (isAllDataAlreadyLoaded(variablesSelection)) {
      // All data and metadata asked for by the user is already loaded in accumulatedData. No need for a new API-call. Create a pxTable from accumulatedData instead.
      const pxTable = createPxTableFromAccumulatedData(variablesSelection);

      if (pxTable) {
        setData(pxTable);
        return;
      }
    }

    let varSelection: VariablesSelection = variablesSelection;
    let diffVariablesSelection: VariablesSelection = { selection: [] };

    // We need to make a new API-call to get the data and metadata not already loaded in accumulatedData
    // Make the API-call as small as possible
    diffVariablesSelection = getDiffVariablesSelection(variablesSelection);

    if (diffVariablesSelection.selection.length > 0) {
      varSelection = getMinimumVariablesSelection(
        variablesSelection,
        diffVariablesSelection,
      );
    }

    // Make the minimal API-call
    let pxTable: PxTable = await fetchFromApi(tableId, i18n, varSelection);

    // Merge pxTable with accumulatedData
    mergeWithAccumulatedData(
      pxTable,
      diffVariablesSelection,
      variablesSelection,
    );
    const pxTableMerged = createPxTableFromAccumulatedData(variablesSelection);
    if (pxTableMerged) {
      pxTable = pxTableMerged;
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
      'json-stat2',
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

    for (const selection of variablesSelection.selection) {
      const variableExists = accumulatedData.metadata.variables.some(
        (variable) => variable.id === selection.variableCode,
      );
      if (!variableExists) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if all data and metadata the user asks for is already loaded in the accumulated data.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @returns `true` if all data the user asks for is already loaded in the accumulated data, `false` otherwise.
   */
  function isAllDataAlreadyLoaded(
    variablesSelection: VariablesSelection,
  ): boolean {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls

      // Create a map for quick lookup of selected variable codes and their values
      const variableMap = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          new Set(variable.values.map((value) => value.code)),
        ]),
      );

      for (const selection of variablesSelection.selection) {
        if (
          selection.valueCodes !== undefined &&
          selection.valueCodes.length > 0
        ) {
          const accumulatedVariableValues = variableMap.get(
            selection.variableCode,
          );

          if (!accumulatedVariableValues) {
            return false;
          }

          for (const valueCode of selection.valueCodes) {
            if (!accumulatedVariableValues.has(valueCode)) {
              return false;
            }
          }
        }
      }

      return true;
    }

    return false;
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
   * Creates a VariablesSelection containing only the variables and values not already loaded in the accumulated data.
   *
   * @param variablesSelection - Variables selection containing all variables and values selected by the user.
   * @returns A VariablesSelection object containing only the variables and values not already loaded in the accumulated data.
   */
  function getDiffVariablesSelection(
    variablesSelection: VariablesSelection,
  ): VariablesSelection {
    if (accumulatedData !== undefined) {
      // Find whats missing in accumulatedData
      const diffVariablesSelection: VariablesSelection =
        structuredClone(variablesSelection);

      // Create a map for quick lookup of accumulated variable codes and their values
      const accumulatedVariableMap = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          new Set(variable.values.map((value) => value.code)),
        ]),
      );

      // Filter out variables and values already loaded in accumulatedData
      diffVariablesSelection.selection =
        diffVariablesSelection.selection.filter((selection) => {
          const accumulatedValues = accumulatedVariableMap.get(
            selection.variableCode,
          );

          if (!accumulatedValues) {
            // Variable not found in accumulatedData, keep it in diffVariablesSelection
            return true;
          }

          // Filter out values already loaded in accumulatedData
          if (selection.valueCodes) {
            selection.valueCodes = selection.valueCodes.filter(
              (valueCode) => !accumulatedValues.has(valueCode),
            );
          }

          // Keep the variable if it has any values left after filtering
          if (selection.valueCodes) {
            return selection.valueCodes.length > 0;
          } else {
            return false;
          }
        });

      return diffVariablesSelection;
    } else {
      const emptyVariablesSelection: VariablesSelection = { selection: [] };
      return emptyVariablesSelection;
    }
  }

  /**
   * Creates a VariablesSelection containing only the minimum information needed to make a new API-call to
   * get the variables and values not already loaded in the accumulated data.
   *
   * @param variablesSelection - Variables selection containing all variables and values selected by the user.
   * @param diffVariablesSelection - Variables selection containing only the variables and values not already loaded in the accumulated data.
   * @returns A minimum VariablesSelection containing only the minimum information needed to make a new API-call.
   */
  function getMinimumVariablesSelection(
    variablesSelection: VariablesSelection,
    diffVariablesSelection: VariablesSelection,
  ): VariablesSelection {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls.

      // Create the new VariablesSelection
      const newVariablesSelection: VariablesSelection =
        structuredClone(variablesSelection);

      newVariablesSelection.selection = newVariablesSelection.selection.map(
        (selection) => {
          const diffSelection = diffVariablesSelection.selection.find(
            (diff) => diff.variableCode === selection.variableCode,
          );
          return diffSelection ? diffSelection : selection;
        },
      );

      return newVariablesSelection;
    } else {
      return variablesSelection;
    }
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
    if (
      accumulatedData !== undefined &&
      diffVariablesSelection.selection.length === 1
    ) {
      // --- Merge metadata ---

      // Create a map of the variables in accumulated data for quick lookup
      const accDataVariables = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          variable,
        ]),
      );

      // 1. Find the variable in accumulated data that we are going to merge new values into
      if (
        accDataVariables.has(diffVariablesSelection.selection[0].variableCode)
      ) {
        // The existing variable in accumulated data
        const existingVariable = accDataVariables.get(
          diffVariablesSelection.selection[0].variableCode,
        );
        // Create a map of existing values for the variable for quick lookup
        const existingValues = new Set(
          existingVariable?.values.map((v) => v.code),
        );

        // 2. Find the variable in variablesSelection that we are going to merge new values from
        const selection = variablesSelection.selection.find(
          (sel) =>
            sel.variableCode ===
            diffVariablesSelection.selection[0].variableCode,
        );

        // 3. Find the variable in pxTable (from the new API call) that we are going to merge new values from
        const updatedVariable = pxTable.metadata.variables.find(
          (variable) =>
            variable.id === diffVariablesSelection.selection[0].variableCode,
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
   * @param i18n - The i18n object for handling langauages
   */
  function handleStubAndHeading(pxTable: PxTable, i18n: i18n) {
    if (
      accumulatedData === undefined ||
      accumulatedData.metadata.id !== pxTable.metadata.id
    ) {
      // First time we get data OR we have a new table.
      // -> Set stub and heading according to the order in pxTable
      const stubOrder: string[] = pxTable.stub.map((variable) => variable.id);
      const headingOrder: string[] = pxTable.heading.map(
        (variable) => variable.id,
      );
      setStub(stubOrder);
      setHeading(headingOrder);
    } else {
      // Language has changed.
      // -> Set stub and heading in pxTable according to the order in state
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

      // Find all new variables and add them to the stub
      const remainingVariables = pxTable.metadata.variables.filter(
        (variable) =>
          !stub.includes(variable.id) && !heading.includes(variable.id),
      );

      if (remainingVariables.length > 0) {
        const newStub = structuredClone(stub);

        remainingVariables.forEach((variable) => {
          if (!newStub.includes(variable.id)) {
            pxTable.stub.push(variable);
            newStub.push(variable.id);
          }
        });
        setStub(newStub);
      }
    }
  }

  return (
    <TableDataContext.Provider
      value={{ data, /* loading, error  */ fetchTableData }}
    >
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext };
