import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

import { getChartCssVariables } from '../Utils/chartHelper';
import {
  applyResponsiveLegend,
  createLegendLayoutController,
  getGridRect,
} from './chartLegendHelper';

// Re-export legend helpers to preserve the public import surface used by chart consumers and tests.
export {
  getFallbackLegendHeight,
  getEstimatedLegendHeight,
  getLegendColumnCount,
} from './chartLegendHelper';

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
  // Keep option updates in one place so legend entries removed from the new
  // option are also removed from the chart instead of being kept by ECharts.
  const setOption = (nextOption: echarts.EChartsOption) => {
    chart.setOption(nextOption, { replaceMerge: ['legend'] });
  };

  if (!isSingleTitleOption(option.title)) {
    setOption(option);
    return;
  }

  const titleTextStyle = option.title.textStyle ?? {};
  const titleWidth = Math.max(80, chart.getWidth() - 32);

  setOption({
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

  const tooltip = Array.isArray(option.tooltip)
    ? option.tooltip.map((tooltipItem) => ({
        ...tooltipItem,
        textStyle: { ...tooltipItem.textStyle, ...textStyle },
      }))
    : {
        ...option.tooltip,
        textStyle: { ...option.tooltip?.textStyle, ...textStyle },
      };

  return {
    ...option,
    legend,
    xAxis: xAxis as echarts.EChartsOption['xAxis'],
    yAxis: yAxis as echarts.EChartsOption['yAxis'],
    title: title as echarts.EChartsOption['title'],
    tooltip: tooltip as echarts.EChartsOption['tooltip'],
  };
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
  const lineStyle = { stroke: axisColor, lineWidth: 1 };
  const gridLineStyle = { stroke: '#e0e6f1', lineWidth: 1 };

  chart.setOption({
    graphic: [
      {
        type: 'line',
        shape: {
          x1: gridRect.x,
          y1: endPixel,
          x2: gridRect.x + gridRect.width,
          y2: endPixel,
        },
        style: gridLineStyle,
        silent: true,
        z: 1,
      },
      {
        type: 'group',
        left: gridRect.x - 6,
        top: centerY - 8,
        silent: true,
        z: 10,
        children: [
          {
            type: 'line',
            shape: { x1: 0, y1: 6, x2: 8, y2: 0 },
            style: lineStyle,
          },
          {
            type: 'line',
            shape: { x1: 0, y1: 12, x2: 8, y2: 6 },
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
) {
  // Ref to the chart container div and the ECharts instance.
  const divRef = useRef<HTMLDivElement | null>(null);

  // Ref to the ECharts instance.
  const chartRef = useRef<echarts.EChartsType | null>(null);

  // State stores the responsive legend estimate used to size the chart.
  const [estimatedLegendHeight, setEstimatedLegendHeight] = useState<
    number | null
  >(null);

  // The legend estimate is used by LineChart to set the total chart height.
  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    setEstimatedLegendHeight(null);

    const chartContainer = divRef.current;
    const chart = echarts.init(chartContainer, null, { renderer });
    chartRef.current = chart;

    const applyOption = () => {
      // Apply the new selection or legend state first. The legend can only be
      // measured after ECharts has rendered the updated option.
      applyOptionWithWrappedTitle(
        chart,
        applyResponsiveLegend(chart, applyStyling(option)),
      );

      applyYAxisBreakMark(chart, option);
    };

    // Create the legend layout controller, which manages the layout and updates of the chart legend.
    const legendLayout = createLegendLayoutController({
      chart,
      chartContainer,
      option,
      setEstimatedLegendHeight: (height) => {
        setEstimatedLegendHeight((previousHeight) =>
          previousHeight === height ? previousHeight : height,
        );
      },
      applyOption,
    });

    applyOption();
    legendLayout.update();

    // Observe the chart container for size changes using the ResizeObserver API.
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(legendLayout.handleResize);

    resizeObserver?.observe(chartContainer);

    // Listen for the browser's loadingdone event, which fires when document fonts have finished loading.
    document.fonts?.addEventListener(
      'loadingdone',
      legendLayout.handleFontLoading,
    );

    // Listen for browser resize events to update the legend layout.
    window.addEventListener('resize', legendLayout.handleResize);

    return () => {
      // Clean up the ResizeObserver, font loading event listener, and window resize event listener.
      resizeObserver?.disconnect();
      document.fonts?.removeEventListener(
        'loadingdone',
        legendLayout.handleFontLoading,
      );
      window.removeEventListener('resize', legendLayout.handleResize);
      chartRef.current = null;
      chart.dispose();
    };
  }, [option, renderer]);

  return {
    divRef,
    chartRef,
    estimatedLegendHeight,
  };
}
