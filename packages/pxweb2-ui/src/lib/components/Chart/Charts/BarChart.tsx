import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

import type { EChartsDataset } from '../chartTypes';

interface BarChartProps {
  readonly dataset: EChartsDataset;
  readonly isHorizontal?: boolean;
}
export function BarChart({ dataset, isHorizontal = false }: BarChartProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }
    const xAxisType = isHorizontal ? { type: 'category' } : {};
    const yAxisType = isHorizontal ? {} : { type: 'category' };
    // Create the echarts instance
    const myChart = echarts.init(divRef.current as HTMLElement, null, {
      renderer: 'svg',
    });
    // Draw the chart
    myChart.setOption({
      title: {
        text: 'ECharts Getting Started Example',
      },
      dataset: {
        dimensions: dataset.dimensions,
        source: dataset.source,
      },
      legend: {},
      tooltip: {},
      // Declare an x-axis (category axis).
      // The category map the first column in the dataset by default.
      xAxis: xAxisType,
      // Declare a y-axis (value axis).
      yAxis: yAxisType,
      series: dataset.series.map((series) => ({
        name: series.name,
        type: 'bar',
      })),
    });

    return () => {
      myChart.dispose();
    };
  }, [divRef, dataset, isHorizontal]);
  return <div ref={divRef} style={{ width: '600px', height: '400px' }}></div>;
}
export default BarChart;
