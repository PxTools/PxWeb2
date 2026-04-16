import { useMemo } from 'react';

import { LineChart } from './Charts/LineChart';
import { BarChart } from './Charts/BarChart';
import { PopulationPyramid } from './Charts/PopulationPyramid';
import { ExportableChart } from './ExportableChart';
import { mapPxTableToChart } from './chartDataMapper';
import type { PxTable } from '../../shared-types/pxTable';

interface ChartProps {
  readonly pxtable: PxTable;
}

export function Chart({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);

  return (
    <div>
      <ExportableChart title="Line Chart Example" fileName="line-chart">
        <LineChart data={chartConfig.data} series={chartConfig.series} />
      </ExportableChart>

      <ExportableChart
        title="Bar Chart Horizontal Example"
        fileName="bar-chart-horizontal"
      >
        <BarChart
          data={chartConfig.data}
          series={chartConfig.series}
          isHorizontal={true}
        />
      </ExportableChart>

      <ExportableChart
        title="Bar Chart Vertical Example"
        fileName="bar-chart-vertical"
      >
        <BarChart data={chartConfig.data} series={chartConfig.series} />
      </ExportableChart>

      <ExportableChart
        title="Population Pyramid Example"
        fileName="population-pyramid"
      >
        <PopulationPyramid pxtable={pxtable} />
      </ExportableChart>
    </div>
  );
}
