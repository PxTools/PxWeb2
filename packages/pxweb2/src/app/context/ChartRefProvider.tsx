import React, { createContext, ReactNode, useMemo, useRef } from 'react';

import type { LineChartHandle } from '@pxweb2/pxweb2-ui';

export interface ChartRefContextType {
  chartRef: React.RefObject<LineChartHandle | null>;
}

interface ChartRefProviderProps {
  children: ReactNode;
}

const ChartRefContext = createContext<ChartRefContextType | undefined>(
  undefined,
);

// Shares one chart instance ref between Presentation (renders the chart) and DrawerSave (exports it), which are siblings.
const ChartRefProvider: React.FC<ChartRefProviderProps> = ({ children }) => {
  const chartRef = useRef<LineChartHandle | null>(null);
  const value = useMemo(() => ({ chartRef }), [chartRef]);

  return (
    <ChartRefContext.Provider value={value}>
      {children}
    </ChartRefContext.Provider>
  );
};

export { ChartRefProvider, ChartRefContext };
