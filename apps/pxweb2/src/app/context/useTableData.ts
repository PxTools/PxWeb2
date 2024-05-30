import { useContext } from 'react';
import { TableDataContext, TableDataContextType } from './TableDataProvider';

const useTableData = (): TableDataContextType => {
  const context = useContext(TableDataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default useTableData;
