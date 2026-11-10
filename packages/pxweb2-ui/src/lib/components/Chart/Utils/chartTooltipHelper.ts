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
): string {
  // ECharts can provide one tooltip item or an array of items.
  // Convert both cases to an array so the code below handles them consistently.
  const axisParams = (Array.isArray(params) ? params : [params]) as
    | TooltipParam[]
    | undefined;

  // There is nothing to display when ECharts provides no data.
  if (!axisParams || axisParams.length === 0) {
    return '';
  }

  // On smaller screens, default to the first series until the user selects one.
  const selectedSeriesIndex =
    hoveredSeriesIndex ??
    (isMediumOrSmallerScreen ? axisParams[0]?.seriesIndex : null);

  // Without a series index, we cannot match the tooltip item to the series metadata.
  if (selectedSeriesIndex == null) {
    return '';
  }

  const title = axisParams[0].axisValueLabel;
  const hoveredParams = axisParams.filter(
    (param) => param.seriesIndex === selectedSeriesIndex,
  );
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