import { useEffect, useRef, useState } from 'react';
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

const SMALL_BREAKPOINT_MAX_WIDTH = 767;
const MEDIUM_BREAKPOINT_MAX_WIDTH = 1199;
const LARGE_BREAKPOINT_MAX_WIDTH = 1399;
const LEGEND_COLUMN_PADDING = 32;
const LEGEND_LINE_HEIGHT = 20;
const LEGEND_LINE_HEIGHT_RATIO = 1.4;
const LEGEND_ITEM_GAP = 8;
const LEGEND_FONT_SIZE = 14;
const LEGEND_SYMBOL_SIZE = 14;

export function getLegendColumnCount(chartWidth: number): number {
  if (chartWidth <= SMALL_BREAKPOINT_MAX_WIDTH) {
    return 1;
  }

  if (chartWidth <= LARGE_BREAKPOINT_MAX_WIDTH) {
    return chartWidth <= MEDIUM_BREAKPOINT_MAX_WIDTH ? 2 : 3;
  }

  return 3;
}

function splitLegendData<T>(data: T[], columnCount: number): T[][] {
  const columns: T[][] = [];
  const baseColumnSize = Math.floor(data.length / columnCount);
  const extraItems = data.length % columnCount;
  let itemIndex = 0;

  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    const columnSize = baseColumnSize + (columnIndex < extraItems ? 1 : 0);
    columns.push(data.slice(itemIndex, itemIndex + columnSize));
    itemIndex += columnSize;
  }

  return columns.filter((column) => column.length > 0);
}

function getLegendText(value: string | { name?: string }): string {
  return typeof value === 'string' ? value : (value.name ?? '');
}

function getLegendFontSize(): number {
  if (typeof document === 'undefined') {
    return LEGEND_FONT_SIZE;
  }

  const rootFontSize = Number.parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );

  return Number.isFinite(rootFontSize)
    ? rootFontSize * 0.875
    : LEGEND_FONT_SIZE;
}

function getLegendLineHeight(fontSize: number): number {
  return Math.max(
    LEGEND_LINE_HEIGHT,
    Math.ceil(fontSize * LEGEND_LINE_HEIGHT_RATIO),
  );
}

function getLegendColumnHeight(
  data: Array<string | { name?: string }>,
  textWidth: number,
  fontSize = getLegendFontSize(),
): number {
  const lineHeight = getLegendLineHeight(fontSize);

  return data.reduce((height, item, index) => {
    const rowHeight = Math.max(
      LEGEND_SYMBOL_SIZE,
      wrapLegendText(getLegendText(item), textWidth, fontSize).split('\n')
        .length * lineHeight,
    );

    return height + rowHeight + (index < data.length - 1 ? LEGEND_ITEM_GAP : 0);
  }, 0);
}

export function getEstimatedLegendHeight(
  chartWidth: number,
  data: echarts.LegendComponentOption['data'],
  fontSize = getLegendFontSize(),
): number | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const columnCount = Math.min(getLegendColumnCount(chartWidth), data.length);
  const columnWidth = chartWidth / columnCount;
  const textWidth = Math.max(80, columnWidth - LEGEND_COLUMN_PADDING);
  const columns = splitLegendData(data, columnCount);
  return Math.max(
    ...columns.map((column) =>
      getLegendColumnHeight(column, textWidth, fontSize),
    ),
  );
}

export function getFallbackLegendHeight(
  data: echarts.LegendComponentOption['data'],
): number {
  const estimates = [320, 768, 1200]
    .map((chartWidth) => getEstimatedLegendHeight(chartWidth, data))
    .filter((height): height is number => height !== null);

  return estimates.length > 0 ? Math.max(...estimates) : 0;
}

function wrapLegendText(
  text: string,
  textWidth: number,
  fontSize = getLegendFontSize(),
): string {
  const charactersPerLine = Math.max(
    1,
    Math.floor(textWidth / (fontSize * 0.55)),
  );

  return text
    .split(/\s+/)
    .reduce((lines, word) => {
      const chunks = word.match(
        new RegExp(`.{1,${charactersPerLine}}`, 'g'),
      ) ?? [''];
      const lastLine = lines.at(-1) ?? '';

      if (
        lastLine &&
        lastLine.length + 1 + chunks[0].length <= charactersPerLine
      ) {
        lines[lines.length - 1] = `${lastLine} ${chunks.shift()}`;
      }

      lines.push(...chunks);
      return lines;
    }, [] as string[])
    .join('\n');
}

function applyHorizontalLegendColumns(
  chart: echarts.EChartsType,
  legend: echarts.LegendComponentOption,
  renderedLegendHeight?: number,
  legendGap: number = 0,
): echarts.LegendComponentOption[] {
  const data = legend.data;

  if (!Array.isArray(data) || data.length === 0) {
    return [legend];
  }

  const columnCount = Math.min(
    getLegendColumnCount(chart.getWidth()),
    data.length,
  );
  const columnWidth = chart.getWidth() / columnCount;
  const textWidth = Math.max(80, columnWidth - LEGEND_COLUMN_PADDING);
  const fontSize = getLegendFontSize();
  const lineHeight = getLegendLineHeight(fontSize);
  const columns = splitLegendData(data, columnCount);
  const itemGap = LEGEND_ITEM_GAP;
  const estimatedLegendHeight = Math.max(
    ...columns.map((column) =>
      getLegendColumnHeight(column, textWidth, fontSize),
    ),
  );
  const gridRect = getGridRect(chart);
  const legendTop =
    gridRect == null
      ? Math.max(
          0,
          chart.getHeight() -
            (renderedLegendHeight ?? estimatedLegendHeight) +
            legendGap,
        )
      : gridRect.y + gridRect.height + legendGap * 2;

  return columns.map((columnData, columnIndex) => ({
    ...legend,
    data: columnData,
    orient: 'vertical',
    left: columnIndex * columnWidth,
    right: undefined,
    top: legendTop,
    bottom: undefined,
    width: columnWidth,
    itemWidth: LEGEND_SYMBOL_SIZE,
    itemHeight: LEGEND_SYMBOL_SIZE,
    itemGap,
    formatter: (name: string) => wrapLegendText(name, textWidth, fontSize),
    textStyle: {
      ...legend.textStyle,
      fontSize,
      lineHeight,
      overflow: 'break',
      width: textWidth,
    },
  }));
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

type LegendMeasurableChart = {
  getModel?: () =>
    | {
        getComponent?: (mainType: string) => unknown;
        getComponentsByType?: (mainType: string) => unknown[];
      }
    | undefined;
  getViewOfComponentModel?: (
    componentModel: unknown,
  ) => { group?: { getBoundingRect?: () => { height: number } } } | undefined;
};

function getRenderedLegendHeight(chart: echarts.EChartsType): number | null {
  // ECharts calculates the actual height after wrapping legend text. Reading
  // the rendered group gives us the real height instead of estimating it from
  // the number of series.
  const measurable = chart as unknown as LegendMeasurableChart;
  const model = measurable.getModel?.();
  const legendModels =
    model?.getComponentsByType?.('legend') ??
    [model?.getComponent?.('legend')].filter(
      (legendModel): legendModel is unknown => legendModel != null,
    );

  if (legendModels.length === 0) {
    return null;
  }

  const heights = legendModels
    .map(
      (legendModel) =>
        measurable
          .getViewOfComponentModel?.(legendModel)
          ?.group?.getBoundingRect?.().height,
    )
    .filter(
      (height): height is number =>
        typeof height === 'number' && Number.isFinite(height),
    );

  return heights.length > 0 ? Math.max(...heights) : null;
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

function applyResponsiveLegend(
  chart: echarts.EChartsType,
  option: echarts.EChartsOption,
  renderedLegendHeight?: number,
  legendGap = 0,
): echarts.EChartsOption {
  const chartWidth = chart.getWidth();
  const legend = option.legend;

  if (Array.isArray(legend)) {
    return {
      ...option,
      legend: legend.flatMap((legendItem) =>
        legendItem.orient === 'vertical' || !Array.isArray(legendItem.data)
          ? {
              ...legendItem,
              width: chartWidth,
              textStyle: {
                ...legendItem.textStyle,
                width: Math.max(80, chartWidth - 40),
              },
            }
          : applyHorizontalLegendColumns(
              chart,
              legendItem,
              renderedLegendHeight,
              legendGap,
            ),
      ),
    };
  }

  if (!legend || legend.orient === 'vertical' || !Array.isArray(legend.data)) {
    return option;
  }

  return {
    ...option,
    legend: applyHorizontalLegendColumns(
      chart,
      legend,
      renderedLegendHeight,
      legendGap,
    ),
  };
}

// Keeps a constant distance between the x axis labels and the legend, no matter how many legend rows are rendered.
function applyLegendGap(
  chart: echarts.EChartsType,
  option: echarts.EChartsOption,
  legendGap: number,
) {
  // The plot grid must leave room for every rendered legend row. This keeps
  // the x-axis labels and the legend from being drawn on top of each other.
  const legendHeight = getRenderedLegendHeight(chart);

  if (legendHeight === null) {
    return;
  }

  const grid = Array.isArray(option.grid) ? option.grid[0] : option.grid;
  const nextBottom = Math.round(legendHeight + legendGap);
  const measurable = chart as unknown as {
    getModel?: () => { getComponent?: (mainType: string) => unknown };
  };
  const currentGridModel = measurable.getModel?.()?.getComponent?.('grid') as
    { option?: { bottom?: unknown } } | undefined;
  const currentBottom = currentGridModel?.option?.bottom ?? grid?.bottom;

  if (currentBottom === nextBottom) {
    return;
  }

  chart.setOption({
    grid: { ...grid, bottom: nextBottom },
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
  legendGap?: number,
) {
  const divRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const lastRenderedLegendHeightRef = useRef<number | null>(null);
  const legendLayoutInvalidatedRef = useRef(false);
  const [renderedLegendHeight, setRenderedLegendHeight] = useState<
    number | null
  >(null);

  // The legend height is measured by ECharts, then used by LineChart to set
  // the total chart height (plot area + gap + legend).
  useEffect(() => {
    if (!divRef.current) {
      return;
    }

    lastRenderedLegendHeightRef.current = null;
    setRenderedLegendHeight(null);

    const chartContainer = divRef.current;
    const chart = echarts.init(chartContainer, null, { renderer });
    chartRef.current = chart;

    const updateRenderedLegendHeight = () => {
      const measuredHeight = getRenderedLegendHeight(chart);

      const legend = Array.isArray(option.legend)
        ? option.legend.find((item) => item.orient === 'horizontal')
        : option.legend;
      const estimatedHeight = getEstimatedLegendHeight(
        chart.getWidth(),
        legend?.data,
      );
      const effectiveHeight =
        measuredHeight === null
          ? estimatedHeight
          : Math.max(measuredHeight, estimatedHeight ?? 0);

      if (effectiveHeight === null) {
        return;
      }

      const heightChanged =
        measuredHeight !== null &&
        measuredHeight !== lastRenderedLegendHeightRef.current;
      const layoutInvalidated = legendLayoutInvalidatedRef.current;
      lastRenderedLegendHeightRef.current = effectiveHeight;
      setRenderedLegendHeight((previousHeight) =>
        previousHeight === effectiveHeight ? previousHeight : effectiveHeight,
      );

      if (measuredHeight !== null && (heightChanged || layoutInvalidated)) {
        legendLayoutInvalidatedRef.current = false;
        applyOption(effectiveHeight, false);
      }

      if (typeof legendGap === 'number') {
        applyLegendGap(chart, option, legendGap);
      }
    };

    const applyOption = (legendHeight?: number, measure = true) => {
      // Apply the new selection or legend state first. The legend can only be
      // measured after ECharts has rendered the updated option.
      applyOptionWithWrappedTitle(
        chart,
        applyResponsiveLegend(
          chart,
          applyStyling(option),
          legendHeight,
          legendGap,
        ),
      );

      applyYAxisBreakMark(chart, option);
      if (measure) {
        updateRenderedLegendHeight();
      }
    };

    let measurementFrame: number | undefined;
    const measureAfterLayout = () => {
      if (measurementFrame !== undefined) {
        cancelAnimationFrame(measurementFrame);
      }

      measurementFrame = requestAnimationFrame(() => {
        measurementFrame = undefined;
        updateRenderedLegendHeight();
      });
    };

    chart.on?.('finished', measureAfterLayout);

    applyOption();

    let previousWidth = chartContainer.clientWidth;

    const handleResize = () => {
      chart.resize();

      // Height changes can be caused by the legend itself. Reacting to those
      // changes would clear the measured height and create a resize loop.
      const currentWidth = chartContainer.clientWidth;
      const widthChanged = currentWidth !== previousWidth;

      if (widthChanged) {
        previousWidth = currentWidth;
        legendLayoutInvalidatedRef.current = true;
        // Use the responsive fallback while the resized legend is being laid
        // out. The previous layout can be too short for the new text wrap.
        lastRenderedLegendHeightRef.current = null;
        setRenderedLegendHeight(null);
        applyOption(undefined, false);
        measureAfterLayout();
      }
    };

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            handleResize();
          });

    resizeObserver?.observe(chartContainer);

    const handleFontLoading = () => {
      chart.resize();
      legendLayoutInvalidatedRef.current = true;
      applyOption(undefined, false);
      measureAfterLayout();
    };

    document.fonts?.addEventListener('loadingdone', handleFontLoading);

    window.addEventListener('resize', handleResize);

    return () => {
      resizeObserver?.disconnect();
      document.fonts?.removeEventListener('loadingdone', handleFontLoading);
      window.removeEventListener('resize', handleResize);
      if (measurementFrame !== undefined) {
        cancelAnimationFrame(measurementFrame);
      }
      chart.off?.('finished', measureAfterLayout);
      chartRef.current = null;
      chart.dispose();
    };
  }, [option, renderer, legendGap]);

  return {
    divRef,
    chartRef,
    renderedLegendHeight:
      renderedLegendHeight ?? lastRenderedLegendHeightRef.current,
  };
}
