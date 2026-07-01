import { useEffect, useMemo, useState } from 'react';
import cl from 'clsx';
import type * as echarts from 'echarts';

import {
  buildDatasetOption,
  buildSeriesOption,
  LINE_SERIES_SYMBOLS,
} from '../Utils/chartOptionBuilder';
import { useEChartOption } from '../Utils/useEChartOption';
import type { PxTable } from '../../../shared-types/pxTable';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import { getChartColorsFromCssVariables } from '../Utils/chartHelper';
import styles from './LineChart.module.scss';

interface LineChartProps {
  readonly pxtable: PxTable;
  readonly colors?: string[];
  readonly legendOverflowMode?: LineChartLegendOverflowMode;
  readonly visibleLegendItemCount?: number;
}

export type LineChartLegendOverflowMode = 'pagination' | 'showMore';

const DEFAULT_VISIBLE_LEGEND_ITEM_COUNT = 8;
const LEGEND_ITEM_HEIGHT = 24;
const MIN_LEGEND_HEIGHT = 40;

type TooltipParam = {
  axisValueLabel?: string;
  seriesIndex: number;
  seriesName: string;
  data?: Record<string, string | number>;
  color?: string;
};

function getTooltipSymbolSvg(symbol: string, color: string): string {
  switch (symbol) {
    case 'rect':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" fill="${color}" /></svg>`;
    case 'triangle':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><polygon points="5,1 9,9 1,9" fill="${color}" /></svg>`;
    case 'diamond':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><polygon points="5,1 9,5 5,9 1,5" fill="${color}" /></svg>`;
    case 'pin':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1a2.2 2.2 0 0 0-2.2 2.2c0 1.8 2.2 5.6 2.2 5.6s2.2-3.8 2.2-5.6A2.2 2.2 0 0 0 5 1z" fill="${color}" /></svg>`;
    case 'arrow':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h5V3l3 2-3 2V5H1z" fill="${color}" /></svg>`;
    default:
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="${color}" /></svg>`;
  }
}

function getNormalizedVisibleLegendItemCount(
  visibleLegendItemCount?: number,
): number {
  return Math.max(
    1,
    Math.floor(visibleLegendItemCount ?? DEFAULT_VISIBLE_LEGEND_ITEM_COUNT),
  );
}

function getLegendItemNames(
  dataset: ReturnType<typeof mapPxTableToChartDataset>,
): string[] {
  return dataset.series.map((series) => series.name);
}

function getLegendData(
  legendItemNames: string[],
  legendOverflowMode: LineChartLegendOverflowMode | undefined,
  visibleLegendItemCount: number,
  showAllLegendItems: boolean,
): string[] | undefined {
  if (!legendOverflowMode || legendItemNames.length <= visibleLegendItemCount) {
    return undefined;
  }

  if (legendOverflowMode === 'pagination') {
    return legendItemNames;
  }

  if (legendOverflowMode === 'showMore' && !showAllLegendItems) {
    return legendItemNames.slice(0, visibleLegendItemCount);
  }

  return legendItemNames;
}

function getVisibleLegendItemCount(
  legendItemCount: number,
  legendOverflowMode: LineChartLegendOverflowMode | undefined,
  visibleLegendItemCount: number,
  showAllLegendItems: boolean,
): number {
  if (!legendOverflowMode || legendItemCount <= visibleLegendItemCount) {
    return legendItemCount;
  }

  if (legendOverflowMode === 'showMore' && showAllLegendItems) {
    return legendItemCount;
  }

  return visibleLegendItemCount;
}

type LineChartLegendOption = {
  readonly height: number;
  readonly data?: string[];
  readonly type?: 'scroll';
  readonly orient?: 'horizontal' | 'vertical';
  readonly pageButtonPosition?: 'start' | 'end';
  readonly pageFormatter?: string;
};

function getLegendHeight(visibleLegendItems: number): number {
  return Math.max(MIN_LEGEND_HEIGHT, visibleLegendItems * LEGEND_ITEM_HEIGHT);
}

function getLegendOption(
  legendItemNames: string[],
  legendOverflowMode: LineChartLegendOverflowMode | undefined,
  visibleLegendItemCount: number,
  visibleLegendItems: number,
  showAllLegendItems: boolean,
): LineChartLegendOption {
  const legendData = getLegendData(
    legendItemNames,
    legendOverflowMode,
    visibleLegendItemCount,
    showAllLegendItems,
  );
  const baseLegend = {
    height: getLegendHeight(visibleLegendItems),
  };

  if (legendOverflowMode === 'pagination' && legendData) {
    return {
      ...baseLegend,
      type: 'scroll',
      orient: 'horizontal',
      data: legendData,
    };
  }

  if (legendData) {
    return {
      ...baseLegend,
      data: legendData,
    };
  }

  return baseLegend;
}

export function LineChart({
  pxtable,
  colors,
  legendOverflowMode,
  visibleLegendItemCount,
}: LineChartProps) {
  const dataset = useMemo(() => mapPxTableToChartDataset(pxtable), [pxtable]);
  const normalizedVisibleLegendItemCount = getNormalizedVisibleLegendItemCount(
    visibleLegendItemCount,
  );
  const [showAllLegendItems, setShowAllLegendItems] = useState(false);

  useEffect(() => {
    setShowAllLegendItems(false);
  }, [dataset, legendOverflowMode, normalizedVisibleLegendItemCount]);

  const legendItemNames = useMemo(() => getLegendItemNames(dataset), [dataset]);
  const hasOverflowingLegend =
    legendItemNames.length > normalizedVisibleLegendItemCount;
  const visibleLegendItems = getVisibleLegendItemCount(
    legendItemNames.length,
    legendOverflowMode,
    normalizedVisibleLegendItemCount,
    showAllLegendItems,
  );
  const legendOptionsMemoized = useMemo(
    () =>
      getLegendOption(
        legendItemNames,
        legendOverflowMode,
        normalizedVisibleLegendItemCount,
        visibleLegendItems,
        showAllLegendItems,
      ),
    [
      legendItemNames,
      legendOverflowMode,
      normalizedVisibleLegendItemCount,
      showAllLegendItems,
      visibleLegendItems,
    ],
  );

  const resolvedColors = useMemo(() => {
    return colors && colors.length > 0
      ? colors
      : getChartColorsFromCssVariables();
  }, [colors]);

  const option = useMemo<echarts.EChartsOption>(
    () => ({
      ...buildDatasetOption(dataset),
      grid: { top: 0, bottom: 200, left: '0', right: '0', containLabel: false },
      xAxis: { type: 'category' as const, axisLabel: { rotate: 45 } },
      yAxis: {
        name: dataset.unit,
        min: (value) => value.min,
      },
      legend: legendOptionsMemoized,
      series: buildSeriesOption(dataset, 'line', resolvedColors),
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const axisParams = (Array.isArray(params) ? params : [params]) as
            | TooltipParam[]
            | undefined;

          if (!axisParams || axisParams.length === 0) {
            return '';
          }

          const title = axisParams[0].axisValueLabel;
          const rows = axisParams
            .map((param) => {
              const seriesMeta = dataset.series[param.seriesIndex];
              const row = param.data as Record<string, string | number>;
              const value = row?.[seriesMeta.key];
              const symbol =
                LINE_SERIES_SYMBOLS[
                  param.seriesIndex % LINE_SERIES_SYMBOLS.length
                ];
              const color = param.color ?? '#666666';

              return `<div style="display:flex;align-items:center;gap:6px"><span style="display:inline-flex;align-items:center">${getTooltipSymbolSvg(symbol, color)}</span><span>${param.seriesName}: ${value ?? ''}</span></div>`;
            })
            .join('');

          return `<div><div>${title}</div>${rows}</div>`;
        },
      },
    }),
    [dataset, legendOptionsMemoized, resolvedColors],
  );

  const { divRef } = useEChartOption(option);
  const hasExpandedLegend =
    visibleLegendItems > DEFAULT_VISIBLE_LEGEND_ITEM_COUNT;

  const controls = (() => {
    if (legendOverflowMode === 'showMore' && hasOverflowingLegend) {
      return (
        <button
          type="button"
          aria-expanded={showAllLegendItems}
          onClick={() => setShowAllLegendItems((current) => !current)}
        >
          {showAllLegendItems ? 'Show less' : 'Show more'}
        </button>
      );
    }

    return null;
  })();

  return (
    <div className={styles.lineChart}>
      <div
        ref={divRef}
        className={cl(styles.chart, {
          [styles.expandedLegend]: hasExpandedLegend,
        })}
      ></div>
      {controls}
    </div>
  );
}
export default LineChart;
