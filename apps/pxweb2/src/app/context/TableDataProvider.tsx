import { i18n } from 'i18next';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useVariables from './useVariables';
import { Dataset, TableService } from '@pxweb2/pxweb2-api-client';
import { PxTable } from '@pxweb2/pxweb2-ui';
import { mapJsonStat2Response } from '../../mappers/JsonStat2ResponseMapper';

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
const TableDataContext = createContext<TableDataContextType | undefined>({
  data: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchTableData: () => {},
});
const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<string>();
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
      'json-stat2'
    );

    // Map response to json-stat2 Dataset
    const pxDataobj: unknown = res;
    const pxTabData = pxDataobj as Dataset;

    const pxTable: PxTable = mapJsonStat2Response(pxTabData);

    setData(JSON.stringify(pxTable));
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
