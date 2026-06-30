import { i18n } from 'i18next';
import React, { createContext, useEffect, useState, ReactNode } from 'react';

import useVariables from './useVariables';
import {
  ApiError,
  Dataset,
  OutputFormatType,
  SavedQueriesService,
  TablesService,
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

import {
  addFormattingToPxTable,
  filterStubAndHeadingArrays,
  autoPivotTable,
  pivotTableCW,
  TableTitlePartsType,
  getTableTitleParts,
  initStubAndHeadingDesktop,
  initStubAndHeadingMobile,
  initStubAndHeadingChart,
} from './TableDataProviderUtils';
import { problemMessage } from '../util/problemMessage';
import { PivotType } from './PivotType';
import { DataViewModeType } from './DataViewModeType';

// Define types for the context state and provider props
export interface TableDataContextType {
  isInitialized: boolean;
  data: PxTable | undefined;
  fetchTableData: (
    tableId: string,
    i18n: i18n,
    dataViewMode: DataViewModeType,
  ) => void;
  fetchSavedQuery: (
    queryId: string,
    i18n: i18n,
    dataViewMode: DataViewModeType,
  ) => void;
  pivotToMobile: () => void;
  pivotToDesktop: () => void;
  pivotToTable: (isMobile: boolean) => void;
  pivotToChart: () => void;
  pivot: (type: PivotType) => void;
  buildTableTitle: () => TableTitlePartsType;
  isFadingTable: boolean;
  setIsFadingTable: (value: boolean) => void;
}

interface TableDataProviderProps {
  children: ReactNode;
}

// Create context with default values
const TableDataContext = createContext<TableDataContextType | undefined>({
  isInitialized: false,
  data: undefined,
  fetchTableData: () => {
    // No-op: useTableData hook prevents this from being called
  },
  fetchSavedQuery: () => {
    // No-op: useTableData hook prevents this from being called
  },
  pivotToMobile: () => {
    // No-op: useTableData hook prevents this from being called
  },
  pivotToDesktop: () => {
    // No-op: useTableData hook prevents this from being called
  },
  pivotToTable: () => {
    // No-op: useTableData hook prevents this from being called
  },
  pivotToChart: () => {
    // No-op: useTableData hook prevents this from being called
  },
  pivot: () => {
    // No-op: useTableData hook prevents this from being called
  },
  buildTableTitle: () => ({
    contentText: '',
    firstTitlePart: '',
    lastTitlePart: '',
  }),
  isFadingTable: false,
  setIsFadingTable: () => {
    // No-op
  },
});

const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  const [isInitialized] = useState(true);
  // Data (metadata) that reflects variables and values selected by user right now. Used as data source for the table
  const [data, setData] = useState<PxTable | undefined>(undefined);
  // Accumulated data (and metadata) from all API calls made by user. Stored in the data cube.
  const [accumulatedData, setAccumulatedData] = useState<PxTable | undefined>(
    undefined,
  );

  // state for data view mode.
  const [dataViewMode, setDataViewMode] = useState<DataViewModeType>(
    DataViewModeType.DesktopTable,
  );

  // Variables in the stub (desktop table)
  const [stubDesktop, setStubDesktop] = useState<string[]>([]);
  // Variables in the heading (desktop table)
  const [headingDesktop, setHeadingDesktop] = useState<string[]>([]);

  // Variables in the stub (mobile table)
  const [stubMobile, setStubMobile] = useState<string[]>([]);
  // Variables in the heading (mobile table)
  const [headingMobile, setHeadingMobile] = useState<string[]>([]);

  // Variables in the stub (chart)
  const [stubChart, setStubChart] = useState<string[]>([]);
  // Variables in the heading (chart)
  const [headingChart, setHeadingChart] = useState<string[]>([]);

  // When default selection is loaded we need to initialize which codelists are selected for each variable.
  const [codelistsInitialized, setCodelistsInitialized] = useState(false);

  // Dictionary that keeps track of selected codelists per variable
  const [variableCodelists, setVariableCodelists] = useState<
    Record<string, string>
  >({});

  const [errorMsg, setErrorMsg] = useState('');
  const [isFadingTable, setIsFadingTable] = useState(false);
  const variables = useVariables();

  useEffect(() => {
    if (errorMsg !== '') {
      throw new Error(errorMsg);
    }
  }, [errorMsg]);

  /**
   * Initializes the codelists for the application context.
   *
   * This function checks if the codelists have already been initialized and if the default selection
   * of variables has been loaded. If both conditions are met, it retrieves the unique variable IDs,
   * determines the corresponding codelist IDs for each variable, and updates the state with the
   * mapping of variable IDs to codelist IDs. Once the codelists are initialized, it sets the
   * `codelistsInitialized` flag to `true`.
   *
   * Dependencies:
   * - `codelistsInitialized`: A boolean indicating whether the codelists have already been initialized.
   * - `variables`: An object containing methods and properties related to variable management.
   *   - `variables.hasLoadedDefaultSelection`: A boolean indicating if the default selection of variables has been loaded.
   *   - `variables.getUniqueIds()`: A method that retrieves an array of unique variable IDs.
   *   - `variables.getSelectedCodelistById(id: string)`: A method that retrieves the codelist ID for a given variable ID.
   *
   * Side Effects:
   * - Updates the `setVariableCodelists` state with the mapping of variable IDs to codelist IDs.
   * - Sets the `codelistsInitialized` state to `true` after initialization.
   *
   * Note:
   * This function is memoized using `React.useCallback` to prevent unnecessary re-executions
   * unless its dependencies (`codelistsInitialized` and `variables`) change.
   */
  const initializeCodelists = React.useCallback(() => {
    if (!codelistsInitialized && variables.hasLoadedInitialSelection) {
      const ids = variables.getUniqueIds();
      ids.forEach((id) => {
        const codelistId = variables.getSelectedCodelistById(id);
        if (codelistId) {
          setVariableCodelists((prevCodelists) => ({
            ...prevCodelists,
            [id]: codelistId,
          }));
        }
      });

      setCodelistsInitialized(true);
    }
  }, [codelistsInitialized, variables]);

  useEffect(() => {
    if (!codelistsInitialized && variables.hasLoadedInitialSelection) {
      initializeCodelists();
    }
  }, [
    codelistsInitialized,
    initializeCodelists,
    variables.hasLoadedInitialSelection,
  ]);

  const initializeStubAndHeadingDesktop = React.useCallback(
    (pxTable: PxTable) => {
      const { stubOrderDesktop, headingOrderDesktop } =
        initStubAndHeadingDesktop(pxTable);

      setStubDesktop(stubOrderDesktop);
      setHeadingDesktop(headingOrderDesktop);

      return {
        stubOrderDesktop,
        headingOrderDesktop,
      };
    },
    [],
  );

  const initializeStubAndHeadingMobile = React.useCallback(
    (pxTable: PxTable) => {
      const { stubOrderMobile, headingOrderMobile } =
        initStubAndHeadingMobile(pxTable);

      setStubMobile(stubOrderMobile);
      setHeadingMobile(headingOrderMobile);

      return {
        stubOrderMobile,
        headingOrderMobile,
      };
    },
    [],
  );

  const initializeStubAndHeadingChart = React.useCallback(
    (pxTable: PxTable) => {
      const { stubOrderChart, headingOrderChart } =
        initStubAndHeadingChart(pxTable);

      setStubChart(stubOrderChart);
      setHeadingChart(headingOrderChart);

      return {
        stubOrderChart,
        headingOrderChart,
      };
    },
    [],
  );

  /**
   * Remember order of variables in stub and heading when table setup is changed.
   *
   * @param pxTable - PxTable containing the data and metadata for display in table.
   * @param dataViewMode - The current data view mode (e.g., mobile, desktop, chart).
   * @param lang - The current language code (e.g., 'en', 'no').
   */
  const initializeStubAndHeading = React.useCallback(
    (pxTable: PxTable, dataViewMode: DataViewModeType, lang: string) => {
      if (
        accumulatedData === undefined || //NOSONAR: This is a valid check to determine if the accumulated data is undefined or if the table ID or language has changed.
        accumulatedData.metadata.id !== pxTable.metadata.id ||
        accumulatedData.metadata.language.toLowerCase() !== lang.toLowerCase()
      ) {
        // First time we get data OR we have a new table OR language is changed.
        const { stubOrderDesktop, headingOrderDesktop } =
          initializeStubAndHeadingDesktop(pxTable);

        const { stubOrderMobile, headingOrderMobile } =
          initializeStubAndHeadingMobile(pxTable);

        const { stubOrderChart, headingOrderChart } =
          initializeStubAndHeadingChart(pxTable);

        if (dataViewMode === DataViewModeType.MobileTable) {
          pivotTable(pxTable, stubOrderMobile, headingOrderMobile);
        } else if (dataViewMode === DataViewModeType.DesktopTable) {
          pivotTable(pxTable, stubOrderDesktop, headingOrderDesktop);
        } else if (dataViewMode === DataViewModeType.Chart) {
          pivotTable(pxTable, stubOrderChart, headingOrderChart);
        }
      } else {
        // The number of variables has changed.

        // Variable has been removed
        // Remove all variables in stubMobile, headingMobile, stubDesktop and headingDesktop that does not exist in table variables
        const variableIds = pxTable.metadata.variables.map(
          (variable) => variable.id,
        );
        if (variableIds.length < stubDesktop.length + headingDesktop.length) {
          const filtered = filterStubAndHeadingArrays(
            variableIds,
            stubDesktop,
            headingDesktop,
            stubMobile,
            headingMobile,
            stubChart,
            headingChart,
          );

          setStubDesktop(filtered.stubDesktop);
          setHeadingDesktop(filtered.headingDesktop);
          setStubMobile(filtered.stubMobile);
          setHeadingMobile(filtered.headingMobile);
          setStubChart(filtered.stubChart);
          setHeadingChart(filtered.headingChart);
        }

        if (dataViewMode === DataViewModeType.MobileTable) {
          pivotTable(pxTable, stubMobile, headingMobile);
        } else if (dataViewMode === DataViewModeType.DesktopTable) {
          pivotTable(pxTable, stubDesktop, headingDesktop);
        } else if (dataViewMode === DataViewModeType.Chart) {
          pivotTable(pxTable, stubChart, headingChart);
        }

        // Variable has been added
        // Find all new variables and add them to the stub - Desktop
        const remainingVariables = pxTable.metadata.variables.filter(
          (variable) =>
            !stubDesktop.includes(variable.id) &&
            !headingDesktop.includes(variable.id),
        );

        if (remainingVariables.length > 0) {
          const newStubDesktop = structuredClone(stubDesktop);
          const newStubMobile = structuredClone(stubMobile);
          const newHeadingChart = structuredClone(headingChart);

          remainingVariables.forEach((variable) => {
            if (!newStubDesktop.includes(variable.id)) {
              pxTable.stub.push(variable);
              newStubDesktop.push(variable.id);
            }
            if (!newStubMobile.includes(variable.id)) {
              newStubMobile.push(variable.id);
            }
            if (!newHeadingChart.includes(variable.id)) {
              newHeadingChart.push(variable.id);
            }
          });
          setStubDesktop(newStubDesktop);
          setStubMobile(newStubMobile);
          setHeadingChart(newHeadingChart);
        }
      }
    },
    [
      accumulatedData,
      initializeStubAndHeadingDesktop,
      initializeStubAndHeadingMobile,
      initializeStubAndHeadingChart,
      stubDesktop,
      headingDesktop,
      stubMobile,
      headingMobile,
      stubChart,
      headingChart,
    ],
  );

  /**
   * Fetches and processes a saved query by its ID, then updates the table data context.
   *
   * @param loadSavedQueryId - The unique identifier of the saved query to load.
   * @param i18n - The i18n object for handling languages.
   * @param dataViewMode - The current data view mode (e.g., mobile, desktop, chart).
   * @returns A promise that resolves when the table data has been fetched, processed, and set.
   *
   * This function:
   * - Calls the SavedQueriesService to run the saved query.
   * - Maps the response to a JSON-stat2 Dataset and then to a PxTable.
   * - Applies formatting to the PxTable's data cell values.
   * - Initializes table stubs and headings based on device type.
   * - Updates the context state with the new table data and stores a cloned copy as accumulated data.
   */
  const fetchSavedQuery = React.useCallback(
    async (
      loadSavedQueryId: string,
      i18n: i18n,
      dataViewMode: DataViewModeType,
    ) => {
      const res = await SavedQueriesService.runSaveQuery(
        loadSavedQueryId,
        i18n.language,
        OutputFormatType.JSON_STAT2,
      );
      // Map response to json-stat2 Dataset
      const pxDataobj: unknown = res;
      const pxTabData = pxDataobj as Dataset;

      const pxTable: PxTable = mapJsonStat2Response(pxTabData);
      // Add formatting to the PxTable datacell values
      await addFormattingToPxTable(pxTable);

      initializeStubAndHeading(pxTable, dataViewMode, i18n.language);
      setData(pxTable);

      // Store as accumulated data
      setAccumulatedData(structuredClone(pxTable));
    },
    [initializeStubAndHeading],
  );

  /*
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param dataViewMode - The current data view mode (e.g., mobile, desktop, chart).
   * @param variablesSelection - User selection of variables and their values.
   * @param codelistChanged - If the codelist has changed.
   */
  const fetchWithoutValidAccData = React.useCallback(
    async (
      tableId: string,
      i18n: i18n,
      dataViewMode: DataViewModeType,
      variablesSelection: VariablesSelection,
      codelistChanged: boolean,
    ) => {
      // Clear current table while fetching new data if codelist has changed
      if (codelistChanged) {
        setData(undefined);
      }

      if (
        accumulatedData?.metadata.language.toLowerCase() !==
        i18n.language.toLowerCase()
      ) {
        variablesSelection = { selection: [] }; // If language is changed we shall fetch data with the default selection.
      }

      const pxTable: PxTable = await fetchFromApi(
        tableId,
        i18n,
        variablesSelection,
      );

      initializeStubAndHeading(pxTable, dataViewMode, i18n.language);
      setData(pxTable);

      // Store as accumulated data
      setAccumulatedData(structuredClone(pxTable));
      // }
    },
    [accumulatedData?.metadata.language, initializeStubAndHeading],
  );

  /**
   * Adds data cell metadata to the notLoadedVarSelection.
   *
   * @param dimensions - An array of dimension values that identifies the data cell in the data cube.
   * @param notLoadedVarSelection - Contains the VariablesSelection for the variables and values not already loaded in the accumulated data.
   */
  const addCellMetadataToNotLoadedSelection = React.useCallback(
    (dimensions: string[], notLoadedVarSelection: VariablesSelection): void => {
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
    },
    [accumulatedData],
  );

  /**
   * Recursively checks if all data and metadata the user asks for is already loaded in the accumulated data.
   * If there are missing datacells in the accumulated data, the missing variables and values are added to the notLoadedVarSelection.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @param dimensions - An array of dimension values used to navigate through the data cubes.
   * @param dimensionIndex - The current index of the dimension being processed.
   * @param notLoadedVarSelection - Out parameter. After the method has finished notLoadedVarSelection contains the VariablesSelection for the variables and values not already loaded in the accumulated data.
   */
  const checkDataCube = React.useCallback(
    (
      variablesSelection: VariablesSelection,
      dimensions: string[],
      dimensionIndex: number,
      notLoadedVarSelection: VariablesSelection,
    ): void => {
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
    },
    [accumulatedData, addCellMetadataToNotLoadedSelection],
  );

  /**
   * Checks if all data and metadata the user asks for is already loaded in the accumulated data.
   * If there are missing datacells in the accumulated data, the missing variables and values are added to the notLoadedVarSelection.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @param notLoadedVarSelection - Out parameter. After the method has finished notLoadedVarSelection contains the VariablesSelection for the variables and values not already loaded in the accumulated data.
   * @returns `true` if all data the user asks for is already loaded in the accumulated data, `false` otherwise.
   */
  const isAllDataAlreadyLoaded = React.useCallback(
    (
      variablesSelection: VariablesSelection,
      notLoadedVarSelection: VariablesSelection,
    ): boolean => {
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
    },
    [accumulatedData, checkDataCube],
  );

  /**
   * Creates a new PxTable from the accumulated data.
   * NOTE! This function assumes that the accumulated data contains all variables and values selected by the user.
   * In other words: isAllDataAlreadyLoaded() must return true before calling this function.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @returns A new PxTable with the data and metadata from the accumulated data, or `undefined` if the accumulated data is `undefined`.
   */
  const createPxTableFromAccumulatedData = React.useCallback(
    (variablesSelection: VariablesSelection): PxTable | undefined => {
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
      pxTable.metadata.variables = pxTable.metadata.variables.filter(
        (variable) => selectionMap.has(variable.id),
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
    },
    [accumulatedData],
  );

  /**
   * Get dimension mapper for how variables are located in new data vs in accumulated data
   *
   * @param accumulatedMetadata - PxTableMetadata object for the accumulated data.
   * @param newMetadata - PxTableMetadata object for the new data.
   * @returns An array with the index of the variables in the new data.
   */
  const getDimensionsMap = React.useCallback(
    (
      accumulatedMetadata: PxTableMetadata,
      newMetadata: PxTableMetadata,
    ): number[] => {
      const dimensionsMap: number[] = [];

      for (let i = 0; i < accumulatedMetadata.variables.length; i++) {
        const index = newMetadata.variables.findIndex(
          (variable) => variable.id === accumulatedMetadata.variables[i].id,
        );
        dimensionsMap[i] = index;
      }

      return dimensionsMap;
    },
    [],
  );

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
  const updateCube = React.useCallback(
    (
      accData: PxTable,
      newData: PxTable,
      dimensions: string[],
      dimensionIndex: number,
      dimensionsMap: number[],
    ): void => {
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
    },
    [],
  );

  /**
   * Merge pxTable from new API call into the accumulatedData in the data cube. Both data and metadata are merged.
   *
   * @param pxTable - PxTable containing the data and metadata from the new API-call.
   * @param diffVariablesSelection - Variables selection containing only the variables and values not already loaded in the accumulated data.
   * @param variablesSelection - Variables selection containing all variables and values selected by the user.
   */
  const mergeWithAccumulatedData = React.useCallback(
    (
      pxTable: PxTable,
      diffVariablesSelection: VariablesSelection,
      variablesSelection: VariablesSelection,
    ): void => {
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

        // -- Merge notes at table level --

        if (pxTable.metadata.notes) {
          pxTable.metadata.notes.forEach((note) => {
            if (
              !accumulatedData.metadata.notes.some((n) => n.text === note.text)
            ) {
              accumulatedData.metadata.notes.push(note);
            }
          });
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
    },
    [accumulatedData, updateCube, getDimensionsMap],
  );

  /**
   * Adjusts the table for mobile layout.
   *
   * @param {PxTable} pxTable - The table to be pivoted.
   */
  const pivotForMobile = React.useCallback(
    (pxTable: PxTable) => {
      pivotTable(pxTable, stubMobile, headingMobile);
    },
    [stubMobile, headingMobile],
  );

  /**
   * Adjusts the table for desktop layout.
   *
   * @param {PxTable} pxTable - The table to be pivoted.
   */
  const pivotForDesktop = React.useCallback(
    (pxTable: PxTable) => {
      pivotTable(pxTable, stubDesktop, headingDesktop);
    },
    [stubDesktop, headingDesktop],
  );

  /**
   * Adjusts the table for chart layout.
   *
   * @param {PxTable} pxTable - The table to be pivoted.
   */
  const pivotForChart = React.useCallback(
    (pxTable: PxTable) => {
      pivotTable(pxTable, stubChart, headingChart);
    },
    [stubChart, headingChart],
  );

  /**
   * Fetch data. We DO have valid accumulated data in the data cube.
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param dataViewMode - The current data view mode (e.g., mobile, desktop, chart).
   * @param variablesSelection - User selection of variables and their values.
   */
  const fetchWithValidAccData = React.useCallback(
    async (
      tableId: string,
      i18n: i18n,
      dataViewMode: DataViewModeType,
      variablesSelection: VariablesSelection,
    ) => {
      // Check if all data and metadata asked for by the user is already loaded from earlier API-calls

      // VariablesSelection for the data that is not already loaded in accumulatedData
      let notLoadedVarSelection: VariablesSelection = { selection: [] };

      if (isAllDataAlreadyLoaded(variablesSelection, notLoadedVarSelection)) {
        // All data and metadata asked for by the user is already loaded in accumulatedData. No need for a new API-call. Create a pxTable from accumulatedData instead.
        const pxTable = createPxTableFromAccumulatedData(variablesSelection);

        if (pxTable) {
          if (dataViewMode === DataViewModeType.MobileTable) {
            pivotForMobile(pxTable);
          } else if (dataViewMode === DataViewModeType.DesktopTable) {
            pivotForDesktop(pxTable);
          } else if (dataViewMode === DataViewModeType.Chart) {
            pivotForChart(pxTable);
          }
          setData(pxTable);
          return;
        }
      }

      // Get the right codelists for the variables
      variablesSelection.selection.forEach((varSel) => {
        if (varSel.codelist) {
          const diffSelection = notLoadedVarSelection.selection.find(
            (sel) => sel.variableCode === varSel.variableCode,
          );
          if (diffSelection) {
            diffSelection.codelist = varSel.codelist;
          } else {
            // All variables that have codelists must be present in the API-call.
            // If not present, we need to add them to the notLoadedVarSelection.
            notLoadedVarSelection.selection.push({
              variableCode: varSel.variableCode,
              valueCodes: [],
              codelist: varSel.codelist,
            });
          }
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
      const pxTableMerged =
        createPxTableFromAccumulatedData(variablesSelection);
      if (pxTableMerged) {
        pxTable = pxTableMerged;
      }

      if (dataViewMode === DataViewModeType.MobileTable) {
        pivotForMobile(pxTable);
      } else if (dataViewMode === DataViewModeType.DesktopTable) {
        pivotForDesktop(pxTable);
      } else if (dataViewMode === DataViewModeType.Chart) {
        pivotForChart(pxTable);
      }

      setData(pxTable);
    },
    [
      isAllDataAlreadyLoaded,
      mergeWithAccumulatedData,
      createPxTableFromAccumulatedData,
      pivotForMobile,
      pivotForDesktop,
      pivotForChart,
    ],
  );

  /**
   * Checks if the accumulated data is valid.
   * @param variablesSelection - User selection of variables and their values.
   * @param language - Language of the current request.
   * @param tableId - The id of the table to fetch data for.
   * @param codelistChanged - A boolean indicating whether the codelist has changed.
   * @returns `true` if the accumulated data is valid, `false` otherwise.
   */
  const isAccumulatedDataValid = React.useCallback(
    (
      variablesSelection: VariablesSelection,
      language: string,
      tableId: string,
      codelistChanged: boolean,
    ): boolean => {
      // accumulatedData must exist
      if (accumulatedData === undefined) {
        return false;
      }

      // accumulatedData must be in the right language
      if (
        accumulatedData.metadata.language.toLowerCase() !==
        language.toLowerCase()
      ) {
        return false;
      }

      // accumulatedData must be from the same table
      if (accumulatedData.metadata.id.toLowerCase() !== tableId.toLowerCase()) {
        return false;
      }

      // If codelist has changed we cannot use the accumulated data
      if (codelistChanged) {
        return false;
      }

      // Get the selections that have values
      const validSelections = variablesSelection.selection.filter(
        (selection) => selection.valueCodes && selection.valueCodes.length > 0,
      );

      // Check that the dimensions are the same in accumulatedData and variablesSelection.
      // The variables must be the same and they must all have at least one value
      if (
        validSelections.length !== accumulatedData.metadata.variables.length
      ) {
        return false;
      }

      // Check if any variable has an empty or undefined valueCodes array
      for (const selection of validSelections) {
        if (!selection.valueCodes || selection.valueCodes.length === 0) {
          return false;
        }
      }

      for (const selection of validSelections) {
        // Check that the variable exists in accumulatedData
        const variable = accumulatedData.metadata.variables.find(
          (variable) => variable.id === selection.variableCode,
        );
        if (!variable) {
          return false;
        }
      }

      return true;
    },
    [accumulatedData],
  );

  /**
   * Manages the selected codelists by comparing the current codelists with the provided selection
   * and updating the state if there are any changes. Returns a boolean indicating whether any
   * codelist was changed.
   *
   * @param variablesSelection - An object containing the selection of variables and their associated codelists.
   * @returns A boolean value indicating whether any codelist was changed (`true` if changed, `false` otherwise).
   *
   * @remarks
   * - The function uses `React.useCallback` to memoize the callback and avoid unnecessary re-renders.
   * - It updates the `variableCodelists` state only when a mismatch between the current codelist and the
   *   provided selection is detected.
   * - The `setVariableCodelists` function is used to update the state with the new codelist values.
   */
  const manageSelectedCodelists = React.useCallback(
    (variablesSelection: VariablesSelection): boolean => {
      let codelistChanged: boolean = false;

      variablesSelection.selection.forEach((selection) => {
        const currentCodelist = variableCodelists[selection.variableCode];
        if (currentCodelist !== selection.codelist) {
          codelistChanged = true;
          setVariableCodelists((prevCodelists) => ({
            ...prevCodelists,
            [selection.variableCode]: selection.codelist ?? '',
          }));
        }
      });
      return codelistChanged;
    },
    [variableCodelists],
  );

  /**
   * Fetches table data from the API (or from accumulated data in the data cube if possible).
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param dataViewMode - The current data view mode (e.g., mobile, desktop, chart).
   */
  const fetchTableData = React.useCallback(
    async (tableId: string, i18n: i18n, dataViewMode: DataViewModeType) => {
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
            selection.codelist = selectedCodeList;
          }

          selections.push(selection);
        });

        const variablesSelection: VariablesSelection = {
          selection: selections,
        };

        const codelistChanged = manageSelectedCodelists(variablesSelection);

        // Check if we have accumulated data in the data cube and if it is valid. If not we cannot use it.
        const validAccData: boolean = isAccumulatedDataValid(
          variablesSelection,
          i18n.language,
          tableId,
          codelistChanged,
        );

        if (validAccData) {
          await fetchWithValidAccData(
            tableId,
            i18n,
            dataViewMode,
            variablesSelection,
          );
        } else {
          // We do not have valid accumulated data in the data cube, so we need to fetch
          await fetchWithoutValidAccData(
            tableId,
            i18n,
            dataViewMode,
            variablesSelection,
            codelistChanged,
          );
        }
        setDataViewMode(dataViewMode);
      } catch (error: unknown) {
        const err = error as Error;

        // Do not want overwrite the error message catched in the fetchFromApi function by calling setErrorMsg again.
        err.message += ' ';
      }
    },
    [
      variables,
      manageSelectedCodelists,
      isAccumulatedDataValid,
      fetchWithValidAccData,
      fetchWithoutValidAccData,
    ],
  );

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
    const res = await TablesService.getTableDataByPost(
      tableId,
      i18n.language,
      OutputFormatType.JSON_STAT2,
      undefined,
      variablesSelection,
    ).catch((error: unknown) => {
      const err = error as ApiError;
      setErrorMsg(problemMessage(err, tableId));
    });

    // Map response to json-stat2 Dataset
    const pxDataobj: unknown = res;
    const pxTabData = pxDataobj as Dataset;

    const pxTable: PxTable = mapJsonStat2Response(pxTabData);

    // Add formatting to the PxTable datacell values
    const formattingResult = await addFormattingToPxTable(pxTable);

    if (formattingResult === false) {
      throw new Error(
        'TableDataProvider.fetchFromApi: Failed to format PxTable datacell values',
      );
    }

    return pxTable;
  };

  /**
   * Pivots the table to mobile layout.
   * This function updates the table structure to fit a mobile layout by adjusting the stub and heading order.
   */
  const pivotToMobile = React.useCallback(() => {
    if (data?.heading !== undefined) {
      const tmpTable = structuredClone(data);

      if (tmpTable !== undefined) {
        pivotTable(tmpTable, stubMobile, headingMobile);
        setData(tmpTable);
        setDataViewMode(DataViewModeType.MobileTable);
      }
    }
  }, [data, stubMobile, headingMobile]);

  /**
   * Pivots the table to desktop layout.
   * This function updates the table structure to fit a desktop layout by adjusting the stub and heading order.
   */
  const pivotToDesktop = React.useCallback(() => {
    if (data?.heading !== undefined) {
      const tmpTable = structuredClone(data);

      if (tmpTable !== undefined) {
        pivotTable(tmpTable, stubDesktop, headingDesktop);
        setData(tmpTable);
        setDataViewMode(DataViewModeType.DesktopTable);
      }
    }
  }, [data, stubDesktop, headingDesktop]);

  /**
   * Pivots to table layout.
   * This function updates the table structure to fit a table layout by adjusting the stub and heading order.
   * If the `isMobile` parameter is true, it pivots to mobile layout; otherwise, it pivots to desktop layout.
   *
   * @param isMobile - A boolean indicating whether to pivot to mobile layout (true) or desktop layout (false).
   */
  const pivotToTable = React.useCallback(
    (isMobile: boolean) => {
      if (isMobile) {
        pivotToMobile();
      } else {
        pivotToDesktop();
      }
    },
    [pivotToDesktop, pivotToMobile],
  );

  /**
   * Pivots the table to chart layout.
   * This function updates the table structure to fit a chart layout by adjusting the stub and heading order.
   */
  const pivotToChart = React.useCallback(() => {
    if (data?.heading !== undefined) {
      const tmpTable = structuredClone(data);

      if (tmpTable !== undefined) {
        pivotTable(tmpTable, stubChart, headingChart);
        setData(tmpTable);
        setDataViewMode(DataViewModeType.Chart);
      }
    }
  }, [data, stubChart, headingChart]);

  /**
   * Builds the table title parts based on the current table data and metadata.
   * @returns An object containing the parts of the table title.
   */
  const buildTableTitle = React.useCallback((): TableTitlePartsType => {
    const vars = data?.metadata.variables || [];
    const stub = data?.stub || [];
    const heading = data?.heading || [];
    const contextText = variables.pxTableMetadata?.contents || '';

    // NOTE: We use the actual objects in the PxTable. We trust that they are not changed by the getTableTitleParts function.
    const tableTitleParts = getTableTitleParts(
      vars,
      stub,
      heading,
      contextText,
    );

    return tableTitleParts;
  }, [data, variables.pxTableMetadata]);

  /**
   * Pivots the table based on the specified pivot type.
   *
   * @param type - The type of pivot to apply (Auto or Custom).
   *
   * This function adjusts the table structure by modifying the stub and heading order
   * according to the specified pivot type. It handles both mobile and desktop layouts,
   * ensuring that the table is appropriately formatted for the current device mode.
   */
  const pivot = React.useCallback(
    (type: PivotType): void => {
      if (
        dataViewMode === DataViewModeType.MobileTable &&
        type === PivotType.Auto
      ) {
        return;
      }
      if (data?.heading === undefined || data?.stub === undefined) {
        return;
      }

      const tmpTable = copyPxTableWithoutData(data);
      let stub: string[] = [];
      let heading: string[] = [];

      if (dataViewMode === DataViewModeType.DesktopTable) {
        stub = structuredClone(stubDesktop);
        heading = structuredClone(headingDesktop);
      } else if (dataViewMode === DataViewModeType.MobileTable) {
        stub = structuredClone(stubMobile);
        heading = structuredClone(headingMobile);
      } else if (dataViewMode === DataViewModeType.Chart) {
        stub = structuredClone(stubChart);
        heading = structuredClone(headingChart);
      }

      if (stub.length === 0 && heading.length === 0) {
        return;
      }

      if (type === PivotType.Auto) {
        autoPivotTable(tmpTable.metadata.variables, stub, heading);
      } else {
        pivotTableCW(stub, heading);
      }

      pivotTable(tmpTable, stub, heading);

      // Reassemble table data
      tmpTable.data = data.data;

      setData(tmpTable);

      if (dataViewMode === DataViewModeType.DesktopTable) {
        setStubDesktop(stub);
        setHeadingDesktop(heading);
      } else if (dataViewMode === DataViewModeType.MobileTable) {
        setStubMobile(stub);
        setHeadingMobile(heading);
      } else if (dataViewMode === DataViewModeType.Chart) {
        setStubChart(stub);
        setHeadingChart(heading);
      }
    },
    [
      dataViewMode,
      data,
      stubDesktop,
      headingDesktop,
      stubMobile,
      headingMobile,
      stubChart,
      headingChart,
    ],
  );

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

  /**
   * Creates a copy of the PxTable without the data.
   */
  function copyPxTableWithoutData(pxTable: PxTable): PxTable {
    const tmpTable: PxTable = {
      metadata: structuredClone(pxTable.metadata),
      data: {
        cube: {},
        variableOrder: [],
        isLoaded: false,
      },
      heading: [],
      stub: [],
    };
    return tmpTable;
  }

  const memoData = React.useMemo(
    () => ({
      data,
      fetchTableData,
      fetchSavedQuery,
      pivotToMobile,
      pivotToDesktop,
      pivotToTable,
      pivotToChart,
      pivot,
      buildTableTitle,
      isInitialized,
      isFadingTable,
      setIsFadingTable,
    }),
    [
      data,
      fetchTableData,
      fetchSavedQuery,
      pivotToMobile,
      pivotToDesktop,
      pivotToTable,
      pivotToChart,
      pivot,
      buildTableTitle,
      isInitialized,
      isFadingTable,
      setIsFadingTable,
    ],
  );

  return (
    <TableDataContext.Provider value={memoData}>
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext };
