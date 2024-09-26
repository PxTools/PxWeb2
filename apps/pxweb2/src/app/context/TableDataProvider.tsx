import { i18n } from 'i18next';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useVariables from './useVariables';
import {
  Dataset,
  TableService,
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import { PxTable } from '@pxweb2/pxweb2-ui';
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
  // Accumulated data (and metadata) from all API calls made by user
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
   * Fetches table data from the API.
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
        valueCodes: variables.getSelectedValuesById(id),
      };
      selections.push(selection);
    });

    const variablesSelection: VariablesSelection = { selection: selections };
    const validAccData: boolean = isAccumulatedDataValid(
      variablesSelection,
      i18n.language,
      tableId
    );

    // Check if all data and metadata asked for by the user is already loaded from earlier API-calls
    if (validAccData && isAllDataAlreadyLoaded(variablesSelection)) {
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

    let varSelection: VariablesSelection;

    // We need to make a new API-call to get the data and metadata not already loaded in accumulatedData
    if (validAccData) { 
      // Make the API-call as small as possible
      varSelection = getMinimumVariablesSelection(variablesSelection);
    }
    else {
      varSelection = variablesSelection;
    }

    const res = await TableService.getTableDataByPost(
      tableId,
      i18n.language,
      'json-stat2',
      varSelection
    );

    // Map response to json-stat2 Dataset
    const pxDataobj: unknown = res;
    const pxTabData = pxDataobj as Dataset;

    const pxTable: PxTable = mapJsonStat2Response(pxTabData);

    setData(pxTable);

      if (!validAccData) {
      console.log('Create accumulatedData from pxTable');
      setAccumulatedData(structuredClone(pxTable));
    }
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
    if (accumulatedData.metadata.language !== language) {
      return false;
    }

    // accumulatedData must be from the same table
    if (accumulatedData.metadata.id !== tableId) {
      return false;
    }

    // TODO: Check that the dimensions are the same in accumulatedData and variablesSelection.
    // The variables must be the same and they must all have at least one value

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
   * Creates a VariablesSelection containing only the minimum information needed to make a new API-call to
   * get the variables and values not already loaded in the accumulated data.
   *
   * @param variablesSelection - Variables selection to copy.
   * @returns A minimum VariablesSelection containing only the minimum information needed to make a new API-call.
   */
  function getMinimumVariablesSelection(
    variablesSelection: VariablesSelection
  ): VariablesSelection {
    if ( accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls.
      console.log({ variablesSelection });

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
      console.log({ diffVariablesSelection });

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

      console.log({ newVariablesSelection });

      return newVariablesSelection;
    } else {
      return variablesSelection;
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
