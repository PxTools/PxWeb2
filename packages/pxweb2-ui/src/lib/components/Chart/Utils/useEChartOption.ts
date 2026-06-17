import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

function isSingleTitleOption(
  title: echarts.EChartsOption['title'],
): title is echarts.TitleComponentOption {
  return typeof title === 'object' && title !== null && !Array.isArray(title);
}

function applyOptionWithWrappedTitle(
  chart: echarts.EChartsType,
  option: echarts.EChartsOption,
) {
  if (!isSingleTitleOption(option.title)) {
    chart.setOption(option);
    return;
  }

  const titleTextStyle = option.title.textStyle ?? {};
  const titleWidth = Math.max(80, chart.getWidth() - 32);

  chart.setOption({
    ...option,
    title: {
      ...option.title,
      left: 0,
      right: 0,
      width: '100%',
      textStyle: {
        ...titleTextStyle,
        overflow: 'break',
        width: titleWidth,
        align: titleTextStyle.align ?? 'center',
      },
    },
  });
}

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

    const chartContainer = divRef.current;
    const chart = echarts.init(chartContainer, null, { renderer });
    chartRef.current = chart;

    applyOptionWithWrappedTitle(chart, option);

    const handleResize = () => {
      chart.resize();
      applyOptionWithWrappedTitle(chart, option);
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            handleResize();
          });

    resizeObserver?.observe(chartContainer);

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
      chartRef.current = null;
      chart.dispose();
    };
  }, [option, renderer]);

  return { divRef, chartRef };
}
