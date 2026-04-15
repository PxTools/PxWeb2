import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

interface BarChartProps {
  readonly dataset: any;
}
export function BarChart({ dataset }: BarChartProps) {
  const divRef = useRef<HTMLDivElement | null>(null);

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
      xAxis: { type: 'category' },
      // Declare a y-axis (value axis).
      yAxis: {},
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
