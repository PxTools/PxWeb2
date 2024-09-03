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
  isLoadingData:boolean
}

interface TableDataProviderProps {
  children: ReactNode;
}

// Create context with default values
const TableDataContext = createContext<TableDataContextType | undefined>({
  data: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchTableData: () => {},
  isLoadingData:false
});
const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  const date = new Date();
  const logtime = () => {
    return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
  };
  console.log('i TABLEPROVIDER 1 ' + logtime());
  const [data, setData] = useState<PxTable | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoadingData,setLoadingData] = useState<boolean>(false)
  const variables = useVariables();

  useEffect(() => {
    if (errorMsg !== '') {
      console.error('ERROR: TableDataProvider:', errorMsg);
    }
  }, [errorMsg]);

  console.log('i TABLEPROVIDER 2 ' + logtime());
  const fetchTableData = async (tableId: string, i18n: i18n) => {
    console.log('I FETCHTABLEDATA 1  ' + logtime());
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
    console.log('I FETCHTABLEDATA 2  ' + logtime());
    setLoadingData(true);
    const res = await TableService.getTableDataByPost(
      tableId,
      i18n.language,
      'json-stat2',
      variablesSelection
    )
    //setLoadingData(false);
    console.log('I FETCHTABLEDATA 3  ' + logtime());
      const pxDataobj: unknown = res;
      setLoadingData(false);
      console.log('I FETCHTABLEDATA 4  ' + logtime());
      const pxTabData = pxDataobj as Dataset;
      console.log('I FETCHTABLEDATA 5  ' + logtime());
      const pxTable: PxTable = mapJsonStat2Response(pxTabData);
      console.log('I FETCHTABLEDATA 6  ' + logtime());
      setData(pxTable);
      console.log('I FETCHTABLEDATA 7  ' + logtime());
    
    
  };
  return (
    <TableDataContext.Provider
      value={{ data, /* loading, error  */ fetchTableData,isLoadingData }}
    >
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext };
