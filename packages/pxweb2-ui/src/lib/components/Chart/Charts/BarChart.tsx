import { useMemo } from 'react';
import type * as echarts from 'echarts';

import { buildDatasetOption, buildSeriesOption } from '../chartOptionBuilder';
import type { EChartsDataset } from '../chartTypes';
import ChartExportButtons from './ChartExportButtons';
import { useEChartOption } from './useEChartOption';

interface BarChartProps {
  readonly dataset: EChartsDataset;
  readonly isHorizontal?: boolean;
  readonly colors?: string[];
}
export function BarChart({
  dataset,
  colors,
  isHorizontal = false,
}: BarChartProps) {
  const option = useMemo<echarts.EChartsOption>(() => {
    const xAxisType = isHorizontal ? ({ type: 'category' } as const) : {};
    const yAxisType = isHorizontal ? {} : ({ type: 'category' } as const);

    return {
      ...buildDatasetOption(dataset),
      grid: { top: 100, bottom: 200, right: '4%', containLabel: true },
      xAxis: xAxisType,
      yAxis: yAxisType,
      series: buildSeriesOption(dataset, 'bar', colors),
      legend: {
        height: 40 * dataset.series.length, // increase legend height based on number of series to prevent overlap with x-axis labels
      },
    };
  }, [dataset, isHorizontal, colors]);

  const { divRef, chartRef } = useEChartOption(option);
  const height = 400 + dataset.series.length * 20; // increase chart height based on number of series to prevent legend overlap

  return (
    <div>
      <ChartExportButtons
        chartRef={chartRef}
        fileName={isHorizontal ? 'bar-chart-horizontal' : 'bar-chart-vertical'}
      />
      <div ref={divRef} style={{ width: '100%', height: `${height}px` }}></div>
    </div>
  );
}
export default BarChart;
