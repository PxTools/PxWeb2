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

type LegendMeasurableChart = {
  getModel?: () => { getComponent?: (mainType: string) => unknown } | undefined;
  getViewOfComponentModel?: (componentModel: unknown) =>
    | { group?: { getBoundingRect?: () => { height: number } } }
    | undefined;
};

function getRenderedLegendHeight(chart: echarts.EChartsType): number | null {
  const measurable = chart as unknown as LegendMeasurableChart;
  const legendModel = measurable.getModel?.()?.getComponent?.('legend');

  if (!legendModel) {
    return null;
  }

  const height = measurable
    .getViewOfComponentModel?.(legendModel)
    ?.group?.getBoundingRect?.().height;

  return typeof height === 'number' && Number.isFinite(height) ? height : null;
}

// Keeps a constant distance between the x axis labels and the legend, no matter how many legend rows are rendered.
function applyLegendGap(
  chart: echarts.EChartsType,
  option: echarts.EChartsOption,
  legendGap: number,
) {
  const legendHeight = getRenderedLegendHeight(chart);

  if (legendHeight === null) {
    return;
  }

  const grid = Array.isArray(option.grid) ? option.grid[0] : option.grid;

  chart.setOption({
    grid: { ...grid, bottom: Math.round(legendHeight + legendGap) },
  });
}

export function useEChartOption(
  option: echarts.EChartsOption,
  renderer: 'canvas' | 'svg' = 'svg',
  legendGap?: number,
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

    const applyOption = () => {
      applyOptionWithWrappedTitle(chart, option);

      if (typeof legendGap === 'number') {
        applyLegendGap(chart, option, legendGap);
      }
    };

    applyOption();

    const handleResize = () => {
      chart.resize();
      applyOption();
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
  }, [option, renderer, legendGap]);

  return { divRef, chartRef };
}
