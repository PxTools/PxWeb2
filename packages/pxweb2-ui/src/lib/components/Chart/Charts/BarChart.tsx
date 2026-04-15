import { useMemo } from 'react';
import type * as echarts from 'echarts';

import { buildDatasetOption, buildSeriesOption } from '../chartOptionBuilder';
import type { EChartsDataset } from '../chartTypes';
import ChartExportButtons from './ChartExportButtons';
import { useEChartOption } from './useEChartOption';

interface BarChartProps {
  readonly dataset: EChartsDataset;
  readonly isHorizontal?: boolean;
}
export function BarChart({ dataset, isHorizontal = false }: BarChartProps) {
  const option = useMemo<echarts.EChartsOption>(() => {
    const xAxisType = isHorizontal ? ({ type: 'category' } as const) : {};
    const yAxisType = isHorizontal ? {} : ({ type: 'category' } as const);

    return {
      ...buildDatasetOption(dataset),
      xAxis: xAxisType,
      yAxis: yAxisType,
      series: buildSeriesOption(dataset, 'bar'),
    };
  }, [dataset, isHorizontal]);

  const { divRef, chartRef } = useEChartOption(option);

  return (
    <div>
      <ChartExportButtons
        chartRef={chartRef}
        fileName={isHorizontal ? 'bar-chart-horizontal' : 'bar-chart-vertical'}
      />
      <div ref={divRef} style={{ width: '600px', height: '400px' }}></div>
    </div>
  );
}
export default BarChart;
