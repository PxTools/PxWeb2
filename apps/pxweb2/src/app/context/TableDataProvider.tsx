import { i18n } from 'i18next';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useVariables from './useVariables';
import {
  Dataset,
  TableService,
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import { PxTable, PxTableMetadata } from '@pxweb2/pxweb2-ui';
import { getPxTableData, setPxTableData } from '@pxweb2/pxweb2-ui';
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
  // Data (metadata) that reflects variables and values selected by user right now
  const [data, setData] = useState<PxTable | undefined>(undefined);
  // Accumulated data (and metadata) from all API calls made by user. Stored in the data cube.
  const [accumulatedData, setAccumulatedData] = useState<PxTable | undefined>(
    undefined
  );
  const [errorMsg, setErrorMsg] = useState('');
  const variables = useVariables();

  useEffect(() => {
    if (errorMsg !== '') {
      console.error('ERROR: TableDataProvider:', errorMsg);
    }
  }, [errorMsg]);

  /**
   * Fetches table data from the API (or from accuumulated data in the data cube if possible).
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

    // Check if the accumulated data in the data cube is valid. If not we cannot use it.
    const validAccData: boolean = isAccumulatedDataValid(
      variablesSelection,
      i18n.language,
      tableId
    );

    if (validAccData) {
      fetchWithValidAccData(tableId, i18n, variablesSelection);
    } 
    else {  
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
  const fetchWithoutValidAccData = async (tableId: string, i18n: i18n, variablesSelection: VariablesSelection) => {
    console.log('Fetch data WITHOUT valid accumulated data');

    const pxTable: PxTable = await fetchFromApi(tableId, i18n, variablesSelection);
    setData(pxTable);

    console.log('Create accumulatedData from pxTable');
    setAccumulatedData(structuredClone(pxTable));
  };

  /**
   * Fetch data. We DO have valid accumulated data in the data cube.
   *
   * @param tableId - The id of the table to fetch data for.
   * @param i18n - The i18n object for handling langauages
   * @param variablesSelection - User selection of variables and their values.
   */
  const fetchWithValidAccData = async (tableId: string, i18n: i18n, variablesSelection: VariablesSelection) => {
    console.log('Fetch data WITH valid accumulated data');

        // Check if all data and metadata asked for by the user is already loaded from earlier API-calls
        if (isAllDataAlreadyLoaded(variablesSelection)) {
          console.log('All data already loaded');
    
          // All data and metadata asked for by the user is already loaded in accumulatedData. No need for a new API-call. Create a pxTable from accumulatedData instead.
          const pxTable = createPxTableFromAccumulatedData(variablesSelection);
    
          if (pxTable) {
            console.log('pxTable created from accumulatedData');
            setData(pxTable);
            return;
          }
        } else {
          console.log('All data not loaded');
        }
    
        let varSelection: VariablesSelection = variablesSelection;
        let diffVariablesSelection: VariablesSelection = { selection: [] };
    
        // We need to make a new API-call to get the data and metadata not already loaded in accumulatedData
        // Make the API-call as small as possible
        diffVariablesSelection = GetDiffVariablesSelection(variablesSelection);
        //console.log({ diffVariablesSelection });
  
        if (diffVariablesSelection.selection.length > 0) {
          varSelection = getMinimumVariablesSelection(
            variablesSelection,
            diffVariablesSelection
          );
          //console.log({ varSelection });
        }
    
        let pxTable: PxTable = await fetchFromApi(tableId, i18n, varSelection);
    
        // Merge pxTable with accumulatedData
        mergeWithAccumulatedData(
          pxTable,
          diffVariablesSelection,
          variablesSelection
        );
        const pxTableMerged =
          createPxTableFromAccumulatedData(variablesSelection);
        if (pxTableMerged) {
          pxTable = pxTableMerged;
        } else {
          console.log('Failed to create PxTable from accumulated data');
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
  const fetchFromApi = async (tableId: string, i18n: i18n, variablesSelection: VariablesSelection) => {
    console.log('Fetching data from API');
    
    const res = await TableService.getTableDataByPost(
      tableId,
      i18n.language,
      'json-stat2',
      variablesSelection
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
    tableId: string
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
    if (variablesSelection.selection.length !== accumulatedData.metadata.variables.length) {
      return false;
    }

    for (const selection of variablesSelection.selection) {
      const variableExists = accumulatedData.metadata.variables.some(
        (variable) => variable.id === selection.variableCode
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
    variablesSelection: VariablesSelection
  ): boolean {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls

      // Create a map for quick lookup of selected variable codes and their values
      const variableMap = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          new Set(variable.values.map((value) => value.code)),
        ])
      );

      for (const selection of variablesSelection.selection) {
        if (
          selection.valueCodes !== undefined &&
          selection.valueCodes.length > 0
        ) {
          const accumulatedVariableValues = variableMap.get(
            selection.variableCode
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
    variablesSelection: VariablesSelection
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
      ])
    );

    // Filter out variables in pxTable that are not present in variablesSelection
    pxTable.metadata.variables = pxTable.metadata.variables.filter((variable) =>
      selectionMap.has(variable.id)
    );

    // Filter out values in each variable that are not present in variablesSelection
    pxTable.metadata.variables.forEach((variable) => {
      const selectedValues = selectionMap.get(variable.id);
      if (selectedValues) {
        variable.values = variable.values.filter((value) =>
          selectedValues.has(value.code)
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
  function GetDiffVariablesSelection(
    variablesSelection: VariablesSelection
  ): VariablesSelection {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls.
      //console.log({ variablesSelection });

      // Find whats missing in accumulatedData
      const diffVariablesSelection: VariablesSelection =
        structuredClone(variablesSelection);

      // Create a map for quick lookup of accumulated variable codes and their values
      const accumulatedVariableMap = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          new Set(variable.values.map((value) => value.code)),
        ])
      );

      // Filter out variables and values already loaded in accumulatedData
      diffVariablesSelection.selection =
        diffVariablesSelection.selection.filter((selection) => {
          const accumulatedValues = accumulatedVariableMap.get(
            selection.variableCode
          );

          if (!accumulatedValues) {
            // Variable not found in accumulatedData, keep it in diffVariablesSelection
            return true;
          }

          // Filter out values already loaded in accumulatedData
          if (selection.valueCodes) {
            selection.valueCodes = selection.valueCodes.filter(
              (valueCode) => !accumulatedValues.has(valueCode)
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
    diffVariablesSelection: VariablesSelection
  ): VariablesSelection {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls.

      // Create the new VariablesSelection
      const newVariablesSelection: VariablesSelection =
        structuredClone(variablesSelection);

      newVariablesSelection.selection = newVariablesSelection.selection.map(
        (selection) => {
          const diffSelection = diffVariablesSelection.selection.find(
            (diff) => diff.variableCode === selection.variableCode
          );
          return diffSelection ? diffSelection : selection;
        }
      );

      //console.log({ newVariablesSelection });

      return newVariablesSelection;
    } else {
      return variablesSelection;
    }
  }

  
   /**
   * Merge pxTable from new API call into the accumulatedData in the data cube.
   *
   * @param pxTable - PxTable containing the data and metadata from the new API-call.
   * @param diffVariablesSelection - Variables selection containing only the variables and values not already loaded in the accumulated data.
   * @param variablesSelection - Variables selection containing all variables and values selected by the user.
   */
  function mergeWithAccumulatedData(
    pxTable: PxTable,
    diffVariablesSelection: VariablesSelection,
    variablesSelection: VariablesSelection
  ): void {
    if (
      accumulatedData !== undefined &&
      diffVariablesSelection.selection.length === 1
    ) {
      // console.log('Merging pxTable with accumulatedData');
      // console.log({ pxTable });
      // console.log({ accumulatedData });
      // console.log({ diffVariablesSelection });
      // console.log({ variablesSelection });

      const mergedVariables = new Map(
        accumulatedData.metadata.variables.map((variable) => [
          variable.id,
          variable,
        ])
      );

      // Find the variable that has new values
      if (
        mergedVariables.has(diffVariablesSelection.selection[0].variableCode)
      ) {
        const existingVariable = mergedVariables.get(
          diffVariablesSelection.selection[0].variableCode
        );
        const existingValues = new Set(
          existingVariable?.values.map((v) => v.code)
        );

        const selection = variablesSelection.selection.find(
          (sel) =>
            sel.variableCode ===
            diffVariablesSelection.selection[0].variableCode
        );

        const newValues = pxTable.metadata.variables.find(
          (variable) =>
            variable.id === diffVariablesSelection.selection[0].variableCode
        )?.values;
        //console.log({ newValues });

        if (newValues) {
          newValues.forEach((value) => {
            if (!existingValues.has(value.code)) {
              // Values are assumed to be sorted in the right order in the VariablesProvider
              const valueIndex = selection?.valueCodes?.indexOf(value.code);
              if (valueIndex !== undefined && valueIndex !== -1) {
                existingVariable?.values.splice(valueIndex, 0, value);
              } else {
                existingVariable?.values.push(value);
              }
              console.log(
                'Merging variable :',
                diffVariablesSelection.selection[0].variableCode,
                'with value:',
                value.code,
                'at index:',
                valueIndex
              );

            }
          });
        }
      }

      // Merge data
      // Variables from the new API-call must be in the same order as the variables in accumulatedData.
      // This might not be the case because the metadata in accumulatedData can be from default selection. 
      // If that is the case the variables in accumulatedData are pivoted.

      // Dimensions in accumulatedData
      const dimensions: string[] = [];

      // Map for dimensions in new data
      const dimensionsMap: number[] = getDimensionsMap(accumulatedData.metadata,  pxTable.metadata);

      //console.log ({ dimensionsMap });

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
  function getDimensionsMap(accumulatedMetadata : PxTableMetadata, newMetadata : PxTableMetadata) : number[] {
    const dimensionsMap: number[] = [];

    for (let i = 0; i < accumulatedMetadata.variables.length; i++) {
        const index = newMetadata.variables.findIndex(
          (variable) => variable.id === accumulatedMetadata.variables[i].id
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
   * This function recursively navigates through the dimensions of the data cubes. For each dimension, it finds the corresponding variable in the new data cube and updates the accumulated data cube with the new values. If the current dimension is the last one, it retrieves the data value from the new data cube and sets it in the accumulated data cube. Otherwise, it continues to the next dimension.
   */
  function updateCube(accData : PxTable, newData : PxTable, dimensions : string[], dimensionIndex : number, dimensionsMap: number[]) : void {
        
    const variableInNewData = newData.metadata.variables.find(
      (variable) => variable.id === accData.metadata.variables[dimensionIndex].id
    );

    if (variableInNewData) {
      if (dimensionIndex === accData.metadata.variables.length - 1) {
        variableInNewData.values.forEach((value) => {
          dimensions[dimensionIndex] = value.code;

          //console.log({ dimensions });
          const newDataDimensions: string[] = new Array(accData.metadata.variables.length);

          for (let i = 0; i < dimensions.length; i++) {
            const index = dimensionsMap[i];
            newDataDimensions[index] = dimensions[i];
          }

          //console.log({ newDataDimensions });
          // Get data value from newData
          const dataValue = getPxTableData(newData.data.cube, newDataDimensions);
          //console.log({ dataValue });

          // Set data in accumulated data cube
          setPxTableData(
            accData.data.cube,
            dimensions,
            structuredClone(dataValue)
          );

        }); 
      }
      else {
        variableInNewData.values.forEach((value) => {
          dimensions[dimensionIndex] = value.code;
          updateCube(accData, newData, dimensions, dimensionIndex + 1, dimensionsMap);
        });
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
