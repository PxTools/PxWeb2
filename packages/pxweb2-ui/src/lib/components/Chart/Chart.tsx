import { useMemo } from 'react';

import { LineChart } from './Charts/LineChart';
import { BarChart } from './Charts/BarChart';
import { PopulationPyramid } from './Charts/PopulationPyramid';
import { mapPxTableToChart } from './chartDataMapper';
import type { PxTable } from '../../shared-types/pxTable';

interface ChartProps {
  readonly pxtable: PxTable;
}

export function Chart({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);

  return (
    <div>
      <h2>Line Chart Example</h2>
      <LineChart data={chartConfig.data} series={chartConfig.series} />
      <h2>Bar Chart Horizontal Example</h2>
      <BarChart
        data={chartConfig.data}
        series={chartConfig.series}
        isHorizontal={true}
      />
      <h2>Bar Chart Vertical Example</h2>
      <BarChart data={chartConfig.data} series={chartConfig.series} />
      <h2>Population Pyramid Example</h2>
      <PopulationPyramid pxtable={pxtable} />
    </div>
  );
}
