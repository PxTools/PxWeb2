import type { EChartsType } from 'echarts';

import type { EChartsDataset } from './chartTypes';

export type TooltipParam = {
  axisValueLabel?: string;
  dataIndex?: number;
  seriesIndex: number;
  seriesName: string;
  data?: Record<string, string | number | null>;
  color?: string;
};

export interface ChartTooltipStyles {
  tooltipContent: string;
  tooltipMarker: string;
  tooltipRow: string;
  tooltipSeries: string;
  tooltipTitle: string;
}

export function formatChartTooltip(
  params: unknown,
  dataset: EChartsDataset,
  hoveredSeriesIndex: number | null,
  isMediumOrSmallerScreen: boolean,
  styles: ChartTooltipStyles,
  getTooltipSymbolSvg: (color: string, seriesIndex: number) => string,
  onActivePointChange?: (point: TooltipParam | undefined) => void, // Callback for reporting which point is currently active in the tooltip
): string {
  if (params == null || (Array.isArray(params) && params.length === 0)) {
    onActivePointChange?.(undefined);
    return '';
  }

  // ECharts can provide one tooltip item or an array of items.
  const axisParams = (
    Array.isArray(params) ? params : [params]
  ) as TooltipParam[];

  // On smaller screens, default to the first series until the user selects one.
  const selectedSeriesIndex =
    hoveredSeriesIndex ??
    (isMediumOrSmallerScreen ? axisParams[0]?.seriesIndex : null);

  // Without a series index, we cannot match the tooltip item to the series metadata.
  if (selectedSeriesIndex == null) {
    onActivePointChange?.(undefined);
    return '';
  }

  const title = axisParams[0].axisValueLabel;
  const hoveredParams = axisParams.filter(
    (param) => param.seriesIndex === selectedSeriesIndex,
  );
  onActivePointChange?.(hoveredParams[0]); // Report the currently hovered point to the callback
  const rows = hoveredParams
    .map((param) => {
      const seriesMeta = dataset.series[param.seriesIndex];
      const value = param.data?.[seriesMeta.key];
      const formattedValue =
        (param.dataIndex == null
          ? undefined
          : dataset.formattedValues[param.dataIndex]?.[seriesMeta.key]) ??
        value;
      const tooltipValue = formattedValue == null ? '' : `${formattedValue}`;
      const color = param.color ?? '#666666';

      return `<div class="${styles.tooltipRow}"><span class="${styles.tooltipMarker}">${getTooltipSymbolSvg(color, param.seriesIndex)}</span><span class="${styles.tooltipSeries}">${param.seriesName}: <strong>${tooltipValue}</strong></span></div>`;
    })
    .join('');

  return `<div class="${styles.tooltipContent}"><div class="${styles.tooltipTitle}">${title}</div>${rows}</div>`;
}

export type PointerPosition = {
  offsetX: number;
  offsetY: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isIsolatedLinePoint(
  value: unknown,
  previousValue: unknown,
  nextValue: unknown,
): value is number {
  return (
    isFiniteNumber(value) &&
    !isFiniteNumber(previousValue) &&
    !isFiniteNumber(nextValue)
  );
}

function getLegendSelection(chart: EChartsType): unknown {
  const legendOption = chart.getOption().legend;
  const legend = Array.isArray(legendOption) ? legendOption[0] : legendOption;

  return legend && typeof legend === 'object' && 'selected' in legend
    ? legend.selected
    : undefined;
}

function isSeriesHidden(selected: unknown, seriesName: string): boolean {
  return Boolean(
    selected &&
    typeof selected === 'object' &&
    Reflect.get(selected, seriesName) === false,
  );
}

export function findClosestIsolatedLineSeries(
  chart: EChartsType,
  dataset: EChartsDataset,
  dataIndex: number,
  row: EChartsDataset['source'][number],
  event: PointerPosition,
): number | undefined {
  let selected: unknown;
  let legendLoaded = false;
  let closestSeriesIndex: number | undefined;
  let closestDistanceSquared = 8 * 8;

  for (const [seriesIndex, series] of dataset.series.entries()) {
    const value = row[series.key];
    const previousValue = dataset.source[dataIndex - 1]?.[series.key];
    const nextValue = dataset.source[dataIndex + 1]?.[series.key];
    if (!isIsolatedLinePoint(value, previousValue, nextValue)) {
      continue;
    }

    const point = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      dataIndex,
      value,
    ]);
    const distanceSquared =
      (point[0] - event.offsetX) ** 2 + (point[1] - event.offsetY) ** 2;
    if (distanceSquared > closestDistanceSquared) {
      continue;
    }

    if (!legendLoaded) {
      selected = getLegendSelection(chart);
      legendLoaded = true;
    }
    if (isSeriesHidden(selected, series.name)) {
      continue;
    }

    closestDistanceSquared = distanceSquared;
    closestSeriesIndex = seriesIndex;
  }

  return closestSeriesIndex;
}
