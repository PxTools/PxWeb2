import { useContext } from 'react';
import { VariablesContext, VariablesContextType } from './VariablesProvider';

const useVariables = (): VariablesContextType => {
  const context = useContext(VariablesContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default useVariables;
