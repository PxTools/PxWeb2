import { useMemo } from 'react';
import type * as echarts from 'echarts';

import {
  buildDatasetOption,
  buildSeriesOption,
} from '../Utils/chartOptionBuilder';
import { useEChartOption } from '../Utils/useEChartOption';
import type { PxTable } from '../../../shared-types/pxTable';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';

interface LineChartProps {
  readonly pxtable: PxTable;
  readonly colors?: string[];
}
export function LineChart({ pxtable, colors }: LineChartProps) {
  const dataset = useMemo(() => mapPxTableToChartDataset(pxtable), [pxtable]);
  const option = useMemo<echarts.EChartsOption>(
    () => ({
      ...buildDatasetOption(dataset),
      grid: { top: 0, bottom: 200, left: '0', right: '0', containLabel: false },
      xAxis: { type: 'category' as const, axisLabel: { rotate: 45 } },
      yAxis: {
        name: dataset.unit,
        min: (value) => value.min,
      },
      legend: {
        height: 40 * dataset.series.length, // increase legend height based on number of series to prevent overlap with x-axis labels
      },
      series: buildSeriesOption(dataset, 'line', colors),
      tooltip: {
        trigger: 'axis',
      },
    }),
    [dataset, colors],
  );

  const { divRef } = useEChartOption(option);
  const height = 600 + dataset.series.length * 10; // increase chart height based on number of series to prevent legend overlap

  return (
    <div>
      <div ref={divRef} style={{ width: '100%', height: `${height}px` }}></div>
    </div>
  );
}
export default LineChart;
