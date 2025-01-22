import { useContext } from 'react';
import { TableDataContext, TableDataContextType } from './TableDataProvider';

const useTableData = (): TableDataContextType => {
  const context = useContext(TableDataContext);
  if (!context || context?.isInitialized === false) {
    throw new Error('useTableData must be used within a TableProvider');
  }
  return context;
};

export default useTableData;
