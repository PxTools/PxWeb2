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
      const chunks = new RegExp(`.{1,${charactersPerLine}}`, 'g').exec(
        word,
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

export function getFallbackLegendHeight(
  data: echarts.LegendComponentOption['data'],
): number {
  const estimates = [320, 768, 1200]
    .map((chartWidth) => getEstimatedLegendHeight(chartWidth, data))
    .filter((height): height is number => height !== null);
  return estimates.length > 0 ? Math.max(...estimates) : 0;
}

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
