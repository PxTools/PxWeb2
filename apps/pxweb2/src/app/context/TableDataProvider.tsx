import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// Define types for the context state and provider props
export interface TableDataContextType {
  data: any;
  /*   loading: boolean;
  error: string | null; */
  fetchData: (tableId: string) => void;
}

interface TableDataProviderProps {
  children: ReactNode;
}

// Create context with default values
const TableDataContext = createContext<TableDataContextType | undefined>(
  undefined
);
const TableDataProvider: React.FC<TableDataProviderProps> = ({ children }) => {
  const [data, setData] = useState<any>({ data: 'Testdata' });

  const fetchData = (tableId: string) => {
    console.log('Fetch data: ' + tableId);
  };

  return (
    <TableDataContext.Provider
      value={{ data, /* loading, error  */ fetchData }}
    >
      {children}
    </TableDataContext.Provider>
  );
};

export { TableDataProvider, TableDataContext as DataContext };

/*

  const getTable = (id: string) => {
    TableService.getMetadataById(id, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(
          tableMetadataResponse
        );
        setPxTableMetadata(pxTabMetadata);

        handleVBReset();

        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTableMetadata(null);
      });
    getData(id);
  };


const getData = (id: string) => {
    const url =
      'https://api.scb.se/OV0104/v2beta/api/v2/tables/' +
      id +
      '/data?lang=' +
      i18n.resolvedLanguage +
      '&outputFormat=html5_table';
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder('iso-8859-1');
        const tableDataResponse = decoder.decode(buffer);
        const thePxData: string = tableDataResponse;
        setPxData(thePxData);
        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTableMetadata(null);
      });
  }; */
