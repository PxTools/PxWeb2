import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';

export function BarChart() {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }
    // Create the echarts instance
    const myChart = echarts.init(divRef.current as HTMLElement);
    // Draw the chart
    myChart.setOption({
      title: {
        text: 'ECharts Getting Started Example',
      },
      tooltip: {},
      xAxis: {
        data: ['shirt', 'cardigan', 'chiffon', 'pants', 'heels', 'socks'],
      },
      yAxis: {},
      series: [
        {
          name: 'sales',
          type: 'bar',
          data: [5, 20, 36, 10, 10, 20],
        },
      ],
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
