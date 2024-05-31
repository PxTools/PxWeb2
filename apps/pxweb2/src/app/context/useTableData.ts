import { useContext } from 'react';
import { TableDataContext, TableDataContextType } from './TableDataProvider';

const useTableData = (): TableDataContextType => {
  const context = useContext(TableDataContext);
  if (context === undefined) {
    throw new Error('useTableData must be used within a VariableProvider');
  }
  return context;
};

export default useTableData;
