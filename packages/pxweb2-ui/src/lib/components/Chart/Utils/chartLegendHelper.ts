import * as echarts from 'echarts';

import {
  BreakpointsMediumMaxWidth,
  BreakpointsSmallMaxWidth,
  BreakpointsXlargeMaxWidth,
} from '../../../../../style-dictionary/dist/js/fixed-variables';

const SMALL_BREAKPOINT_MAX_WIDTH = Number.parseInt(
  BreakpointsSmallMaxWidth,
  10,
);
const MEDIUM_BREAKPOINT_MAX_WIDTH = Number.parseInt(
  BreakpointsMediumMaxWidth,
  10,
);
const LARGE_BREAKPOINT_MAX_WIDTH = Number.parseInt(
  BreakpointsXlargeMaxWidth,
  10,
);
const LEGEND_COLUMN_PADDING = 32;
const LEGEND_LINE_HEIGHT = 20;
const LEGEND_LINE_HEIGHT_RATIO = 1.4;
const LEGEND_ITEM_GAP = 8;
const LEGEND_FONT_SIZE = 14;
const LEGEND_SYMBOL_SIZE = 14;

/**
 * Returns the number of legend columns appropriate for the chart width.
 * @param chartWidth The chart width in pixels.
 * @returns The number of columns to use for the legend.
 */
export function getLegendColumnCount(chartWidth: number): number {
  if (chartWidth <= SMALL_BREAKPOINT_MAX_WIDTH) {
    return 1;
  }
  if (chartWidth <= LARGE_BREAKPOINT_MAX_WIDTH) {
    return chartWidth <= MEDIUM_BREAKPOINT_MAX_WIDTH ? 2 : 3;
  }
  return 3;
}

/**
 * Splits legend entries into balanced, non-empty columns.
 * @param data The legend entries to split.
 * @param columnCount The requested number of columns.
 * @returns The legend entries grouped into non-empty columns.
 */
function splitLegendData<T>(data: T[], columnCount: number): T[][] {
  const columns: T[][] = [];
  // Distribute the remainder across the first columns so the columns stay
  // as balanced as possible instead of putting all extra entries at the end.
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

/**
 * Gets the displayable text from a legend entry.
 * @param value A legend label or named legend entry.
 * @returns The text to display for the legend entry.
 */
function getLegendText(value: string | { name?: string }): string {
  return typeof value === 'string' ? value : (value.name ?? '');
}

/**
 * Gets the root-relative font size used when measuring legend text.
 * @returns The legend font size in pixels.
 */
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

/**
 * Calculates the minimum row height for the supplied legend font size.
 * @param fontSize The legend font size in pixels.
 * @returns The line height in pixels.
 */
function getLegendLineHeight(fontSize: number): number {
  return Math.max(
    LEGEND_LINE_HEIGHT,
    Math.ceil(fontSize * LEGEND_LINE_HEIGHT_RATIO),
  );
}

/**
 * Wraps legend text to fit the available width.
 * @param text The legend text to wrap.
 * @param textWidth The available text width in pixels.
 * @param fontSize The font size used to estimate characters per line.
 * @returns The wrapped text, using newline characters between lines.
 */
function wrapLegendText(
  text: string,
  textWidth: number,
  fontSize = getLegendFontSize(),
): string {
  // Estimate how many characters fit on one line. This is intentionally an
  // approximation because ECharts measures the final text when it renders.
  const charactersPerLine = Math.max(
    1,
    Math.floor(textWidth / (fontSize * 0.55)),
  );

  return text
    .split(/\s+/)
    .reduce((lines, word) => {
      // Split long words as well as normal text, so a single long series name
      // cannot force the legend column wider than the available space.
      const chunks = new RegExp(`.{1,${charactersPerLine}}`, 'g').exec(
        word,
      ) ?? [''];
      const lastLine = lines.at(-1) ?? '';

      // Keep the first chunk of the current word on the previous line when it
      // still fits. The remaining chunks become separate lines below it.
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

/**
 * Calculates the rendered height of one legend column.
 * @param data The legend entries in the column.
 * @param textWidth The available text width in pixels.
 * @param fontSize The font size used to measure the entries.
 * @returns The estimated column height in pixels.
 */
function getLegendColumnHeight(
  data: Array<string | { name?: string }>,
  textWidth: number,
  fontSize = getLegendFontSize(),
): number {
  const lineHeight = getLegendLineHeight(fontSize);
  return data.reduce((height, item, index) => {
    // A wrapped label can be taller than its symbol, so use whichever height
    // is larger for each row before adding the gap to the next row.
    const rowHeight = Math.max(
      LEGEND_SYMBOL_SIZE,
      wrapLegendText(getLegendText(item), textWidth, fontSize).split('\n')
        .length * lineHeight,
    );
    return height + rowHeight + (index < data.length - 1 ? LEGEND_ITEM_GAP : 0);
  }, 0);
}

/**
 * Estimates the height required by a responsive legend at a given width.
 * @param chartWidth The chart width in pixels.
 * @param data The legend entries to measure.
 * @param fontSize The font size used to measure the entries.
 * @returns The estimated legend height in pixels, or null when there is no data.
 */
export function getEstimatedLegendHeight(
  chartWidth: number,
  data: echarts.LegendComponentOption['data'],
  fontSize = getLegendFontSize(),
): number | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const columnCount = Math.min(getLegendColumnCount(chartWidth), data.length);
  // Each column gets an equal share of the chart width. Keep a small amount
  // of space for the legend symbol and its surrounding padding.
  const textWidth = Math.max(
    80,
    chartWidth / columnCount - LEGEND_COLUMN_PADDING,
  );
  return Math.max(
    ...splitLegendData(data, columnCount).map((column) =>
      getLegendColumnHeight(column, textWidth, fontSize),
    ),
  );
}

/**
 * Gets a conservative legend height fallback across supported breakpoints.
 * @param data The legend entries to measure.
 * @returns The largest estimated legend height in pixels, or zero without data.
 */
export function getFallbackLegendHeight(
  data: echarts.LegendComponentOption['data'],
): number {
  const estimates = [320, 768, 1200]
    .map((chartWidth) => getEstimatedLegendHeight(chartWidth, data))
    .filter((height): height is number => height !== null);
  return estimates.length > 0 ? Math.max(...estimates) : 0;
}

/**
 * Gets the chart grid rectangle from ECharts' internal coordinate model.
 * @param chart The ECharts instance whose grid should be measured.
 * @returns The grid rectangle, or null when ECharts has not exposed one.
 */
export function getGridRect(
  chart: echarts.EChartsType,
): { x: number; y: number; width: number; height: number } | null {
  const measurable = chart as unknown as {
    getModel?: () =>
      { getComponent?: (mainType: string) => unknown } | undefined;
  };
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

/**
 * Converts one horizontal legend into balanced vertical legend columns.
 * @param chart The ECharts instance being configured.
 * @param legend The horizontal legend option to convert.
 * @param renderedLegendHeight The measured legend height, when available.
 * @param legendGap The gap between the plot area and legend in pixels.
 * @returns The converted legend options, one for each column.
 */
function applyHorizontalLegendColumns(
  chart: echarts.EChartsType,
  legend: echarts.LegendComponentOption,
  renderedLegendHeight?: number,
  legendGap = 0,
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
  // The tallest column determines the space needed below the chart.
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
      : // When the grid rectangle is available, position the legend directly
        // below the plot area rather than calculating it from the full chart.
        gridRect.y + gridRect.height + legendGap * 2;

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
    itemGap: LEGEND_ITEM_GAP,
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

/**
 * Applies responsive sizing and column layout to chart legend options.
 * @param chart The ECharts instance being configured.
 * @param option The chart option containing the legend.
 * @param renderedLegendHeight The measured legend height, when available.
 * @param legendGap The gap between the plot area and legend in pixels.
 * @returns The chart option with responsive legend layout applied.
 */
export function applyResponsiveLegend(
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

/**
 * The small part of the ECharts API needed to measure rendered legends.
 *
 * These methods are optional because ECharts does not expose all of them in
 * its public TypeScript type, and they may not be available until the chart
 * has finished rendering. The chart is cast to this type only when measuring
 * the actual legend height.
 */
type LegendMeasurableChart = {
  /** Gives access to ECharts' internal component model. */
  getModel?: () =>
    | {
        /** Finds one component of the requested type, such as `legend`. */
        getComponent?: (mainType: string) => unknown;

        /** Finds all components of the requested type, including multiple legends. */
        getComponentsByType?: (mainType: string) => unknown[];
      }
    | undefined;

  /** Gets the rendered view for a specific ECharts component model. */
  getViewOfComponentModel?: (
    componentModel: unknown,
  ) => { group?: { getBoundingRect?: () => { height: number } } } | undefined;
};

/**
 * Measures the tallest rendered legend component using ECharts' view groups.
 * @param chart The ECharts instance whose legend should be measured.
 * @returns The tallest legend height in pixels, or null when it cannot be measured.
 */
export function getRenderedLegendHeight(
  chart: echarts.EChartsType,
): number | null {
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

/**
 * Updates the chart grid bottom to preserve the requested legend gap.
 * @param chart The ECharts instance whose grid should be updated.
 * @param option The chart option containing the current grid configuration.
 * @param legendGap The desired gap below the plot area in pixels.
 * @returns Nothing. The chart is updated in place when necessary.
 */
export function applyLegendGap(
  chart: echarts.EChartsType,
  option: echarts.EChartsOption,
  legendGap: number,
) {
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
  if (currentBottom !== nextBottom) {
    chart.setOption({ grid: { ...grid, bottom: nextBottom } });
  }
}

export type LegendLayoutController = {
  /** Measures the legend immediately and updates the chart layout if needed. */
  update: () => void;

  /** Resizes the chart and schedules a new legend measurement after the container changes size. */
  handleResize: () => void;

  /** Recalculates the legend layout after document fonts finish loading. */
  handleFontLoading: () => void;

  /** Queues one legend measurement on the next animation frame. */
  scheduleUpdate: () => void;

  /** Cancels any pending measurement when the chart is being destroyed. */
  dispose: () => void;
};

type LegendLayoutControllerOptions = {
  /** The ECharts instance whose legend and grid are being managed. */
  chart: echarts.EChartsType;

  /** The DOM element whose width is used to detect layout changes. */
  chartContainer: HTMLDivElement;

  /** The original chart option containing the legend configuration and data. */
  option: echarts.EChartsOption;

  /** The spacing, in pixels, between the plot area and the legend. */
  legendGap?: number;

  /** Stores the most recently rendered legend height without causing a React render. */
  lastRenderedLegendHeightRef: { current: number | null };

  /** Indicates that a resize or font change requires the legend layout to be recalculated. */
  legendLayoutInvalidatedRef: { current: boolean };

  /** Updates React state with the latest measured or estimated legend height. */
  setRenderedLegendHeight: (height: number | null) => void;

  /** Applies updated ECharts options after the legend height is known. */
  applyOption: (legendHeight?: number) => void;
};

/**
 * Creates a controller that keeps the responsive legend layout in sync with
 * the rendered ECharts chart.
 *
 * The controller measures the legend after ECharts renders, falls back to an
 * estimated height when measurement is not available yet, and reports the
 * effective height to React. When the chart width or loaded fonts change, it
 * invalidates the layout, reapplies the chart options, and schedules a new
 * measurement on the next animation frame.
 *
 * Call `update` for the initial measurement, `scheduleUpdate` after ECharts
 * finishes rendering, and the resize/font handlers when the surrounding
 * layout changes. Call `dispose` when the chart is destroyed to cancel any
 * pending measurement.
 */
export function createLegendLayoutController({
  chart,
  chartContainer,
  option,
  legendGap,
  lastRenderedLegendHeightRef,
  legendLayoutInvalidatedRef,
  setRenderedLegendHeight,
  applyOption,
}: LegendLayoutControllerOptions): LegendLayoutController {
  // Measure the legend and use the result to keep the chart height and grid
  // spacing in sync with the legend that ECharts actually rendered.
  const update = () => {
    // ECharts can expose the real rendered height after drawing the legend.
    const measuredHeight = getRenderedLegendHeight(chart);

    // Find the horizontal legend because that is the legend whose height this
    // controller manages. Vertical legends have a different layout strategy.
    const legend = Array.isArray(option.legend)
      ? option.legend.find((item) => item.orient === 'horizontal')
      : option.legend;

    // Before ECharts has rendered the legend, estimate its height from the
    // chart width and labels so the chart still has a usable initial height.
    const estimatedHeight = getEstimatedLegendHeight(
      chart.getWidth(),
      legend?.data,
    );

    // Prefer the real measurement, but never use less space than the estimate.
    const effectiveHeight =
      measuredHeight === null
        ? estimatedHeight
        : Math.max(measuredHeight, estimatedHeight ?? 0);

    // There is no legend height to apply when the legend has no data and no
    // rendered measurement is available.
    if (effectiveHeight === null) {
      return;
    }

    // A changed measured height or an invalidated layout means ECharts needs
    // to receive updated legend options.
    const heightChanged =
      measuredHeight !== null &&
      measuredHeight !== lastRenderedLegendHeightRef.current;
    const layoutInvalidated = legendLayoutInvalidatedRef.current;

    // Keep both the non-rendering ref and the React state in sync. The ref is
    // used for comparisons; the state lets the chart component recalculate
    // its rendered height.
    lastRenderedLegendHeightRef.current = effectiveHeight;
    setRenderedLegendHeight(effectiveHeight);

    // Only reapply options after a real ECharts measurement is available. An
    // estimate is enough for sizing but should not trigger a layout loop.
    if (measuredHeight !== null && (heightChanged || layoutInvalidated)) {
      legendLayoutInvalidatedRef.current = false;
      applyOption(effectiveHeight);
    }

    // Keep the requested gap between the plot area and the legend in pixels.
    if (typeof legendGap === 'number') {
      applyLegendGap(chart, option, legendGap);
    }
  };

  // Store the scheduled frame so repeated events can replace it instead of
  // creating several measurements for the same layout change.
  let measurementFrame: number | undefined;
  const scheduleUpdate = () => {
    if (measurementFrame !== undefined) {
      cancelAnimationFrame(measurementFrame);
    }

    // Wait until the browser has completed the current rendering work before
    // measuring the legend, ensuring that its dimensions are up to date.
    measurementFrame = requestAnimationFrame(() => {
      measurementFrame = undefined;
      update();
    });
  };

  let previousWidth = chartContainer.clientWidth;
  const handleResize = () => {
    // Let ECharts recalculate its internal dimensions before measuring the
    // legend again.
    chart.resize();

    const currentWidth = chartContainer.clientWidth;
    if (currentWidth === previousWidth) {
      return;
    }

    // A width change can alter column count and text wrapping, so discard the
    // old height and rebuild the legend layout after rendering completes.
    previousWidth = currentWidth;
    legendLayoutInvalidatedRef.current = true;
    lastRenderedLegendHeightRef.current = null;
    setRenderedLegendHeight(null);
    applyOption();
    scheduleUpdate();
  };

  const handleFontLoading = () => {
    // Loaded fonts can change label widths and wrapping even when the chart
    // container itself has not changed size.
    chart.resize();
    legendLayoutInvalidatedRef.current = true;
    applyOption();
    scheduleUpdate();
  };

  return {
    update,
    handleResize,
    handleFontLoading,
    scheduleUpdate,
    dispose: () => {
      if (measurementFrame !== undefined) {
        cancelAnimationFrame(measurementFrame);
      }
    },
  };
}
