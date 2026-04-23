import { useMemo } from 'react';
import type * as echarts from 'echarts';

import { buildDatasetOption, buildSeriesOption } from '../chartOptionBuilder';
import type { EChartsDataset } from '../chartTypes';
import ChartExportButtons from './ChartExportButtons';
import { useEChartOption } from './useEChartOption';

interface LineChartProps {
  readonly dataset: EChartsDataset;
}
export function LineChart({ dataset }: LineChartProps) {
  const option = useMemo<echarts.EChartsOption>(
    () => ({
      ...buildDatasetOption(dataset),
      xAxis: { type: 'category' as const },
      yAxis: {},
      series: buildSeriesOption(dataset, 'line'),
    }),
    [dataset],
  );

  const { divRef, chartRef } = useEChartOption(option);

  return (
    <div>
      <ChartExportButtons chartRef={chartRef} fileName="line-chart" />
      <div ref={divRef} style={{ width: '600px', height: '400px' }}></div>
    </div>
  );
}
export default LineChart;
