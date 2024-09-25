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

    // Check if all data and metadata asked for by the user is already loaded from earlier API-calls
    if (isAllDataAlreadyLoaded(variablesSelection, i18n.language)) {
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

    // 4A. accumulatedData did not contain all we need ---> Fetch data from API
    // (Create a minimal API-call to get only whats missing in accumulatedData)
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

    setData(pxTable);

    // If tableId or language has changed, create a deep copy of the new pxTable
    if (
      accumulatedData !== undefined &&
      (tableId !== accumulatedData.metadata.id ||
        i18n.language !== accumulatedData.metadata.language)
    ) {
      console.log('New table loaded. Create a deep copy of the new pxTable');
      // New table loaded. Create a deep copy of the new pxTable
      setAccumulatedData(structuredClone(pxTable));
    }

    if (accumulatedData === undefined) {
      // First API-call. Create a deep copy of pxTable
      console.log('First API-call. Create a deep copy of pxTable');
      setAccumulatedData(structuredClone(pxTable));
    } else {
      // 4B. Add all new data and metadata from API-call to accumulatedData
    }
  };

  /**
   * Checks if all data and metadata the user asks for is already loaded in the accumulated data.
   *
   * @param variablesSelection - User selection of variables and their values.
   * @param language - Language of the current request.
   * @returns `true` if all data the user asks for is already loaded in the accumulated data, `false` otherwise.
   */
  function isAllDataAlreadyLoaded(
    variablesSelection: VariablesSelection,
    language: string
  ): boolean {
    if (accumulatedData !== undefined) {
      // We have data and metadata from earlier API-calls

      // Check if the language of the accumulated data matches the language of the current request
      if (language !== accumulatedData.metadata.language) {
        return false;
      }

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

  return (
    <TableDataContext.Provider
      value={{ data, /* loading, error  */ fetchTableData }}
    >
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext };
