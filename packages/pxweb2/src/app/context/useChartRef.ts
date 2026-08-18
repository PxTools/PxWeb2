import { useContext } from 'react';
import { ChartRefContext, ChartRefContextType } from './ChartRefProvider';

const useChartRef = (): ChartRefContextType => {
  const context = useContext(ChartRefContext);
  if (!context) {
    throw new Error('useChartRef must be used within a ChartRefProvider');
  }
  return context;
};

export default useChartRef;
