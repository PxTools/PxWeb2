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
  data: {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchTableData: () => {},
});
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
      'json-stat2'
    );

    // const isoBytes = new Uint8Array(
    //   res.split('').map((char) => char.charCodeAt(0))
    // );
    // const decoder = new TextDecoder('iso-8859-1');
    // const tableDataResponse = decoder.decode(isoBytes);

    // setData(tableDataResponse);

    // Map response to json-stat2 Dataset
    const pxDataobj: unknown = res;
    const pxTabData = pxDataobj as Dataset;
    console.log({pxTabData});

    const pxTable: PxTable = mapJsonStat2Response(pxTabData);

    console.log({pxTable});
    
    // TODO: Create mapper that maps json-stat2 Dataset to PxTable object

    
    // TODO: Set pxTable in useState hook...
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
