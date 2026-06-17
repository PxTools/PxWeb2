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
      grid: { top: 100, bottom: 200, right: '4%', containLabel: true },
      xAxis: { type: 'category' as const, axisLabel: { rotate: 45 } },
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
      legend: {
        height: 40 * dataset.series.length, // increase legend height based on number of series to prevent overlap with x-axis labels
      },
      series: buildSeriesOption(dataset, 'line', colors),
      dataZoom: [
        {
          id: 'dataZoomX',
          type: 'slider',
          xAxisIndex: [0],
          filterMode: 'filter',
          bottom: 60,
        },
      ],
      // For line charts, tooltips are more useful when triggered by axis to show values of all series at a given category
      tooltip: {
        trigger: 'axis',
      },
    }),
    [dataset, colors],
  );

  const { divRef, chartRef } = useEChartOption(option);
  const height = 600 + dataset.series.length * 10; // increase chart height based on number of series to prevent legend overlap

  return (
    <div>
      <ChartExportButtons chartRef={chartRef} fileName="line-chart" />
      <div ref={divRef} style={{ width: '100%', height: `${height}px` }}></div>
    </div>
  );
}
export default LineChart;
