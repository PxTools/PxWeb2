import { i18n } from 'i18next';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useVariables from './useVariables';
import { TableService } from '@pxweb2/pxweb2-api-client';
import { stringify } from 'querystring';

// Define types for the context state and provider props
export interface TableDataContextType {
  data: any;
  /*   loading: boolean;
  error: string | null; */
  fetchTableData: (tableId: string, i18n: i18n) => void;
}

interface TableDataProviderProps {
  children: ReactNode;
}

// Create context with default values
const TableDataContext = createContext<TableDataContextType | undefined>(
  undefined
);
const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<string | null>('');
  const [errorMsg, setErrorMsg] = useState('');
  const variables = useVariables();

  useEffect(() => {
    console.error('ERROR: TableDataProvider:', errorMsg);
  }, [errorMsg]);

  const fetchTableData = async (tableId: string, i18n: i18n) => {
    const valueCodes: Record<string, Array<string>> = {};

    const ids = variables.getUniqueIds();
    ids.forEach((id) => {
      valueCodes[id] = variables.getSelectedValuesById(id);
    });

    const res = await TableService.getTableData(
      tableId,
      i18n.language,
      valueCodes,
      undefined,
      undefined,
      'html5_table'
    );
    setData(res);
  };

  return (
    <TableDataContext.Provider
      value={{ data, /* loading, error  */ fetchTableData }}
    >
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext };
