import { useContext } from 'react';
import { AppContext, AppContextType } from './AppProvider';

const useApp = (): AppContextType => {
  const context = useContext(AppContext);

  if (context.isInitialized === false) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};

export default useApp;
