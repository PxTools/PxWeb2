import { useContext } from 'react';

import { TitleContext, TitleContextType } from './TitleProvider';

const useTitle = (): TitleContextType => {
  const context = useContext(TitleContext);
  if (!context) {
    throw new Error('useTitle must be used within a TitleProvider');
  }
  return context;
};

export default useTitle;
