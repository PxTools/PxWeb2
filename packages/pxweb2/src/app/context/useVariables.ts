import { useContext } from 'react';
import { VariablesContext, VariablesContextType } from './VariablesProvider';

const useVariables = (): VariablesContextType => {
  const context = useContext(VariablesContext);
  if (context.isInitialized === false) {
    throw new Error('useVariables must be used within a VariableProvider');
  }
  return context;
};

export default useVariables;
