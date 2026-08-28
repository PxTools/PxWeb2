import { useMemo, useState } from 'react';
import type * as echarts from 'echarts';

import { Button } from '../../Button/Button';
import {
  buildDatasetOption,
  buildSeriesOption,
  LINE_SERIES_SYMBOLS,
} from '../Utils/chartOptionBuilder';
import { useEChartOption } from '../Utils/useEChartOption';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';

import {
  getAdaptiveYAxisMax,
  getAdaptiveYAxisMin,
  getChartCssVariables,
  checkMultipleUnits,
} from '../Utils/chartHelper';
import EmptyState from '../../EmptyState/EmptyState';
import type { EmptyStateProps } from '../../EmptyState/EmptyState';
import type { PxTable } from '../../../shared-types/pxTable';

type TooltipParam = {
  axisValueLabel?: string;
  seriesIndex: number;
  seriesName: string;
  data?: Record<string, string | number>;
  color?: string;
};

const LEGEND_ITEM_HEIGHT = 40;
const X_AXIS_LABEL_TO_LEGEND_GAP = 36;
const TOP_CHART_PADDING = 36;

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

interface LineChartTranslations {
  readonly showMore: string;
  readonly showLess: string;
  readonly emptyStateTitle: string;
  readonly emptyStateDescription: string;
}

interface LineChartProps {
  readonly pxtable: PxTable;
  readonly colors?: string[];
  readonly emptyStateSvgName?: EmptyStateProps['svgName'];
  readonly translations: LineChartTranslations;
  readonly isMediumOrSmallerScreen?: boolean;
}

export function LineChart({
  pxtable,
  colors,
  emptyStateSvgName,
  translations,
  isMediumOrSmallerScreen = false,
}: LineChartProps) {
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  const hasMultipleUnits = checkMultipleUnits(pxtable);

  const xAxisName = useMemo(() => {
    return pxtable.stub.map((variable) => variable.label).join(' / ');
  }, [pxtable]);

  const resolvedColors = useMemo(() => {
    return colors && colors.length > 0
      ? colors
      : getChartCssVariables()?.chartColors;
  }, [colors]);

  const resolvedEmptyStateTitle =
    translations.emptyStateTitle?.trim() || 'Cannot display chart';
  const resolvedEmptyStateDescription =
    translations.emptyStateDescription?.trim() ||
    'The line chart cannot be displayed because your selection includes contents with different units (for example number and percent). Please select contents with the same unit to see the line chart.';
  const resolvedEmptyStateSvgName: EmptyStateProps['svgName'] =
    emptyStateSvgName && emptyStateSvgName.trim().length > 0
      ? emptyStateSvgName
      : 'ManWithMagnifyingGlass';

  const dataset = useMemo(() => mapPxTableToChartDataset(pxtable), [pxtable]);
  const hasLegendOverflow = dataset.series.length > 5;
  const shouldShowLegendToggle = hasLegendOverflow && isMediumOrSmallerScreen;
  const shouldShowLimitedLegend = shouldShowLegendToggle && !isLegendExpanded;
  const memoizedAllLegendData = useMemo(
    () => dataset.series.map((series) => series.name),
    [dataset.series],
  );
  const memoizedLimitedLegendData = useMemo(() => {
    return memoizedAllLegendData.slice(0, 5);
  }, [memoizedAllLegendData]);
  const visibleLegendData = shouldShowLimitedLegend
    ? memoizedLimitedLegendData
    : memoizedAllLegendData;
  //const estimatedLegendHeight = LEGEND_ITEM_HEIGHT * visibleLegendData.length;
  const option = useMemo<echarts.EChartsOption>(() => {
    const estimatedLegendHeight = LEGEND_ITEM_HEIGHT * dataset.series.length;
    return {
      ...buildDatasetOption(dataset),
      grid: {
        top: TOP_CHART_PADDING,
        bottom: estimatedLegendHeight + X_AXIS_LABEL_TO_LEGEND_GAP,
        left: '0',
        right: '0',
        // ECharts 6 replacement for the deprecated containLabel. 'same' keeps axis labels
        // inside the grid rect, and 'all' also keeps the axis names inside it.
        outerBoundsMode: 'same',
        outerBoundsContain: 'all',
        //containLabel: true,
      },
      xAxis: {
        type: 'category' as const,
        name: xAxisName,
        nameLocation: 'end',
        // Keeps the axis name clear of the rotated labels instead of using a hardcoded nameGap.
        nameMoveOverlap: true,
        axisLabel: { rotate: 45 },
        axisLine: {
          show: true,
        },
        axisTick: { show: true, alignWithLabel: true },
      },
      yAxis: {
        name: dataset.unit,
        scale: true,
        min: getAdaptiveYAxisMin,
        max: getAdaptiveYAxisMax,
        axisLine: {
          show: true,
        },
        axisTick: { show: true },
      },
      legend: {
        data: visibleLegendData,
        bottom: 0,
        //height: 40 * visibleLegendData.length, // increase legend height based on number of series to prevent overlap with x-axis labels
      },
      series: buildSeriesOption(dataset, 'line', resolvedColors),
      emphasis: {
        focus: 'series',
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const axisParams = (Array.isArray(params) ? params : [params]) as
            TooltipParam[] | undefined;

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
    };
  }, [dataset, resolvedColors, xAxisName, visibleLegendData]);

  const { divRef } = useEChartOption(option, 'svg', X_AXIS_LABEL_TO_LEGEND_GAP);
  const height = 36 + dataset.series.length * 0.8; // increase chart height based on number of series to prevent legend overlap

  return (
    <>
      {hasMultipleUnits ? (
        <EmptyState
          svgName={resolvedEmptyStateSvgName}
          headingTxt={resolvedEmptyStateTitle}
          descriptionTxt={resolvedEmptyStateDescription}
        />
      ) : (
        <>
          <div
            ref={divRef}
            style={{ width: '100%', height: `${height}rem` }}
          ></div>
          {shouldShowLegendToggle && (
            <LegendToggleButton
              onClick={() => setIsLegendExpanded((current) => !current)}
              text={
                isLegendExpanded ? translations.showLess : translations.showMore
              }
            />
          )}
        </>
        //  )
      )}
    </>
  );
}

interface LegendToggleButtonProps {
  readonly onClick: () => void;
  readonly text: string;
}

function LegendToggleButton({ onClick, text }: LegendToggleButtonProps) {
  return (
    <Button onClick={onClick} variant="tertiary" size="small">
      {text}
    </Button>
  );
}
