import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

interface BarChartProps {
  readonly dataset: any;
  readonly isHorizontal?: boolean;
}
export function BarChart({ dataset, isHorizontal = false }: BarChartProps) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const xAxisType = isHorizontal ? { type: 'category' } : {};
  const yAxisType = isHorizontal ? {} : { type: 'category' };

  useEffect(() => {
    if (!divRef.current) {
      return;
    }
    // Create the echarts instance
    const myChart = echarts.init(divRef.current as HTMLElement, null, {
      renderer: 'svg',
    });
    // Draw the chart
    myChart.setOption({
      title: {
        text: 'ECharts Getting Started Example',
      },
      dataset: dataset,
      legend: {},
      tooltip: {},
      // Declare an x-axis (category axis).
      // The category map the first column in the dataset by default.
      xAxis: xAxisType,
      // Declare a y-axis (value axis).
      yAxis: yAxisType,
      // Declare several 'bar' series,
      // every series will auto-map to each column by default.
      series: [{ type: 'bar' }, { type: 'bar' }, { type: 'bar' }],
    });
  }, [divRef]);
  return (
    <div
      id="graph"
      ref={divRef}
      style={{ width: '600px', height: '400px' }}
    ></div>
  );
}
export default BarChart;
