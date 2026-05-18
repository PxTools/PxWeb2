import { useMemo } from 'react';
import type * as echarts from 'echarts';

import { buildDatasetOption, buildSeriesOption } from '../chartOptionBuilder';
import type { EChartsDataset } from '../chartTypes';
import ChartExportButtons from './ChartExportButtons';
import { useEChartOption } from './useEChartOption';

interface LineChartProps {
  readonly dataset: EChartsDataset;
  readonly colors?: string[];
}
export function LineChart({ dataset, colors }: LineChartProps) {
  const option = useMemo<echarts.EChartsOption>(
    () => ({
      ...buildDatasetOption(dataset),
      grid: { top: 100, bottom: 50, right: '4%', containLabel: true },
      xAxis: { type: 'category' as const },
      yAxis: {
        name: dataset.unit,
        // For line charts with small values, start y-axis at 0 to avoid misleading representation
        // axisLabel: {
        //   formatter: '{value} kg',
        //   align: 'center',
        // },
        // min: 100,
        min: (value) => value.min, 
      },
      series: buildSeriesOption(dataset, 'line', colors),
    }),
    [dataset, colors],
  );

  const { divRef, chartRef } = useEChartOption(option);

  return (
    <div>
      <ChartExportButtons chartRef={chartRef} fileName="line-chart" />
      <div ref={divRef} style={{ width: '100%', height: '400px' }}></div>
    </div>
  );
}
export default LineChart;
