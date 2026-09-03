import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

import { getChartCssVariables } from '../Utils/chartHelper';

const textStyle = {
  fontFamily: 'PxWeb-font, sans-serif',
  fontSize: '0.875rem',
  color: getFontColor().color,
} satisfies NonNullable<echarts.EChartsOption['textStyle']>;

function getAxisColor(): { color: string } {
  return { color: getChartCssVariables()?.axisColor || '#162327' };
}
function getFontColor(): { color: string } {
  return { color: getChartCssVariables()?.fontColor || '#162327' };
}

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
  getViewOfComponentModel?: (
    componentModel: unknown,
  ) => { group?: { getBoundingRect?: () => { height: number } } } | undefined;
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

function applyStyling(option: echarts.EChartsOption): echarts.EChartsOption {
  const axisColor = getAxisColor();
  const xAxis = Array.isArray(option.xAxis)
    ? option.xAxis.map((axis) => ({
        ...axis,
        axisLine: {
          ...axis.axisLine,
          lineStyle: {
            ...axis.axisLine?.lineStyle,
            ...axisColor,
          },
        },
        nameTextStyle: { ...textStyle, align: 'left' },
        axisLabel: { ...axis.axisLabel, ...textStyle },
      }))
    : {
        ...option.xAxis,
        axisLine: {
          ...option.xAxis?.axisLine,
          lineStyle: {
            ...option.xAxis?.axisLine?.lineStyle,
            ...axisColor,
          },
        },
        nameTextStyle: { ...textStyle, align: 'left' },
        axisLabel: {
          ...option.xAxis?.axisLabel,
          ...textStyle,
        },
      };
  const yAxis = Array.isArray(option.yAxis)
    ? option.yAxis.map((axis) => ({
        ...axis,
        axisLine: {
          ...axis.axisLine,
          lineStyle: { ...axis.axisLine?.lineStyle, ...axisColor },
        },
        axisLabel: { ...axis.axisLabel, ...textStyle },
        nameTextStyle: { ...textStyle, align: 'left' },
      }))
    : {
        ...option.yAxis,
        axisLine: {
          ...option.yAxis?.axisLine,
          lineStyle: {
            ...option.yAxis?.axisLine?.lineStyle,
            ...axisColor,
          },
        },
        nameTextStyle: { ...textStyle, align: 'left' },
        axisLabel: {
          ...option.yAxis?.axisLabel,
          ...textStyle,
        },
      };
  const legend = Array.isArray(option.legend)
    ? option.legend.map((legendItem) => ({
        ...legendItem,
        textStyle: { ...legendItem.textStyle, ...textStyle },
      }))
    : {
        ...option.legend,
        textStyle: { ...option.legend?.textStyle, ...textStyle },
      };

  const title = Array.isArray(option.title)
    ? option.title.map((titleItem) => ({
        ...titleItem,
        textStyle: { ...titleItem.textStyle, ...textStyle },
      }))
    : {
        ...option.title,
        textStyle: { ...option.title?.textStyle, ...textStyle },
      };

  return {
    ...option,
    legend,
    xAxis: xAxis as echarts.EChartsOption['xAxis'],
    yAxis: yAxis as echarts.EChartsOption['yAxis'],
    title: title as echarts.EChartsOption['title'],
  };
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

type BreakMeasurableChart = {
  getModel?: () => { getComponent?: (mainType: string) => unknown } | undefined;
  convertToPixel?: (
    finder: Record<string, number>,
    value: number,
  ) => number | number[] | undefined;
};

function getYAxisBreakRange(
  option: echarts.EChartsOption,
): { start: number; end: number } | null {
  const yAxis = Array.isArray(option.yAxis) ? option.yAxis[0] : option.yAxis;
  const breaks = (
    yAxis as { breaks?: Array<{ start?: unknown; end?: unknown }> } | undefined
  )?.breaks;
  const singleBreak = breaks?.[0];

  if (
    typeof singleBreak?.start !== 'number' ||
    typeof singleBreak?.end !== 'number'
  ) {
    return null;
  }

  return { start: singleBreak.start, end: singleBreak.end };
}

function getGridRect(
  chart: echarts.EChartsType,
): { x: number; y: number; width: number; height: number } | null {
  const measurable = chart as unknown as BreakMeasurableChart;
  const gridModel = measurable.getModel?.()?.getComponent?.('grid') as
    | {
        coordinateSystem?: {
          getRect?: () => {
            x: number;
            y: number;
            width: number;
            height: number;
          };
        };
      }
    | undefined;

  return gridModel?.coordinateSystem?.getRect?.() ?? null;
}

// Draws a compact "//" mark directly on the y-axis at the break, instead of relying on
// ECharts' default zigzag band which stretches across the whole chart width.
function applyYAxisBreakMark(
  chart: echarts.EChartsType,
  option: echarts.EChartsOption,
) {
  const breakRange = getYAxisBreakRange(option);

  if (!breakRange) {
    return;
  }

  const measurable = chart as unknown as BreakMeasurableChart;
  const gridRect = getGridRect(chart);
  const startPixel = measurable.convertToPixel?.(
    { yAxisIndex: 0 },
    breakRange.start,
  );
  const endPixel = measurable.convertToPixel?.(
    { yAxisIndex: 0 },
    breakRange.end,
  );

  if (
    !gridRect ||
    typeof startPixel !== 'number' ||
    typeof endPixel !== 'number'
  ) {
    return;
  }

  const centerY = (startPixel + endPixel) / 2;
  const axisColor = getAxisColor().color;
  const lineStyle = { stroke: axisColor, lineWidth: 2 };

  chart.setOption({
    graphic: [
      {
        type: 'group',
        left: gridRect.x - 6,
        top: centerY - 8,
        silent: true,
        z: 10,
        children: [
          {
            type: 'line',
            shape: { x1: 0, y1: 16, x2: 8, y2: 0 },
            style: lineStyle,
          },
          {
            type: 'line',
            shape: { x1: 6, y1: 16, x2: 14, y2: 0 },
            style: lineStyle,
          },
        ],
      },
    ],
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
      applyOptionWithWrappedTitle(chart, applyStyling(option));

      if (typeof legendGap === 'number') {
        applyLegendGap(chart, option, legendGap);
      }

      applyYAxisBreakMark(chart, option);
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
