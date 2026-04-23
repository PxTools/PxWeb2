import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export function useEChartOption(
  option: echarts.EChartsOption,
  renderer: 'canvas' | 'svg' = 'svg',
) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const chart = echarts.init(divRef.current, null, { renderer });
    chartRef.current = chart;
    chart.setOption(option);

    return () => {
      chartRef.current = null;
      chart.dispose();
    };
  }, [option, renderer]);

  return { divRef, chartRef };
}
