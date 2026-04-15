import BarChart from './Charts/BarChart';
import LineChart from './Charts/LineChart';
import { useMemo } from 'react';
import {
  mapChartConfigToEChartsDataset,
  mapPxTableToChart,
} from './chartDataMapper';

import type { PxTable } from '../../shared-types/pxTable';

interface ChartProps {
  readonly pxtable: PxTable;
}
export function Chart({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);
  const dataset = useMemo(
    () => mapChartConfigToEChartsDataset(chartConfig),
    [chartConfig],
  );

  return (
    <>
      <BarChart dataset={dataset} isHorizontal={true}></BarChart>;
      <BarChart dataset={dataset}></BarChart>;
      <LineChart dataset={dataset}></LineChart>;
    </>
  );
}
export default Chart;
