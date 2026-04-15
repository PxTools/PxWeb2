import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

export function useEChartOption(
  option: echarts.EChartsOption,
  renderer: 'canvas' | 'svg' = 'svg',
) {
  const divRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    const chart = echarts.init(divRef.current, null, { renderer });
    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [option, renderer]);

  return divRef;
}
