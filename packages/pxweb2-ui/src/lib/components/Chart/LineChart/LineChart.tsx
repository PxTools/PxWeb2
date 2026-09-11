import { useEffect, useMemo, useRef, useState } from 'react';
import type * as echarts from 'echarts';
import cl from 'clsx';

import styles from './LineChart.module.scss';
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
  getAdaptiveYAxisInterval,
  getChartCssVariables,
  getYAxisBreak,
  checkMultipleUnits,
} from '../Utils/chartHelper';
import EmptyState from '../../EmptyState/EmptyState';
import type { EmptyStateProps } from '../../EmptyState/EmptyState';
import type { PxTable } from '../../../shared-types/pxTable';

// ECharts passes one of these objects to the tooltip formatter whenever the
// user points at or clicks a chart value. The formatter uses this information
// to decide what value and label to display.
type TooltipParam = {
  axisValueLabel?: string;
  // Position of the selected row in the chart dataset.
  dataIndex?: number;
  // Position of the selected series in the dataset's series list.
  seriesIndex: number;
  seriesName: string;
  // Raw chart values for the selected row, keyed by series name.
  data?: Record<string, string | number | null>;
  color?: string;
};

const LEGEND_ITEM_HEIGHT = 40;
const X_AXIS_LABEL_TO_LEGEND_GAP = 36;
const TOP_CHART_PADDING = 36;
const CHART_FONT_FAMILY = 'PxWeb-font, sans-serif';

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

  // Stores the position of the chart series the user is currently hovering.
  // null means that no series has been selected yet. A ref is used because
  // this value is only needed by chart event handlers and the tooltip; changing
  // it should not cause the whole chart component to render again.
  const hoveredSeriesIndexRef = useRef<number | null>(null);
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
  const yAxisValues = useMemo(() => {
    return dataset.source
      .flatMap((row) => dataset.series.map((series) => row[series.key]))
      .filter((value): value is number => typeof value === 'number');
  }, [dataset]);
  const yAxisDataExtent = useMemo(() => {
    if (yAxisValues.length === 0) {
      return undefined;
    }

    return {
      min: Math.min(...yAxisValues),
      max: Math.max(...yAxisValues),
    };
  }, [yAxisValues]);
  const yAxisBreak = useMemo(() => {
    if (!yAxisDataExtent) {
      return undefined;
    }

    return getYAxisBreak(yAxisDataExtent);
  }, [yAxisDataExtent]);
  const yAxisInterval = useMemo(() => {
    if (!yAxisBreak || !yAxisDataExtent) {
      return undefined;
    }

    return getAdaptiveYAxisInterval(yAxisDataExtent);
  }, [yAxisBreak, yAxisDataExtent]);

  const option = useMemo<echarts.EChartsOption>(() => {
    const estimatedLegendHeight = LEGEND_ITEM_HEIGHT * visibleLegendData.length;
    const series = buildSeriesOption(dataset, 'line', resolvedColors).map(
      (seriesOption) => ({
        ...seriesOption,
        emphasis: isMediumOrSmallerScreen
          ? { disabled: true }
          : { focus: 'series' as const },
      }),
    ) as echarts.EChartsOption['series'];

    return {
      ...buildDatasetOption(dataset),
      grid: {
        top: TOP_CHART_PADDING,
        bottom: estimatedLegendHeight + X_AXIS_LABEL_TO_LEGEND_GAP,
        left: '0',
        right: '0',
        //'same' keeps axis labels inside the grid rect
        outerBoundsMode: 'same',
        // 'all' keeps the axis names inside the grid rect
        outerBoundsContain: 'all',
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
        scale: false,
        min: 0,
        max: getAdaptiveYAxisMax,
        interval: yAxisInterval,
        ...(yAxisBreak
          ? {
              breaks: [yAxisBreak],
              breakArea: { show: false },
            }
          : {}),
        axisLine: {
          show: true,
          breakLine: false,
        },
        axisTick: { show: true },
      },
      legend: {
        data: visibleLegendData,
        bottom: 0,
      },
      series,
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click|mousewheel',
        confine: true,
        appendToBody: true,
        extraCssText:
          'max-width:370px;box-sizing:border-box;white-space:normal;overflow-wrap:anywhere;',
        formatter: (params: unknown) => {
          // ECharts can provide one tooltip item or an array of items.
          // Convert both cases to an array so the code below handles them
          // consistently.
          const axisParams = (Array.isArray(params) ? params : [params]) as
            TooltipParam[] | undefined;

          // There is nothing to display when ECharts provides no data.
          if (!axisParams || axisParams.length === 0) {
            return '';
          }

          // On smaller screens, show the series selected by the user. If no
          // series has been selected yet, use the first series from ECharts.
          // On larger screens, the normal axis tooltip behavior is used.
          const selectedSeriesIndex =
            hoveredSeriesIndexRef.current ??
            (isMediumOrSmallerScreen ? axisParams[0]?.seriesIndex : null);

          // Without a series index, we cannot match the tooltip item to the
          // chart's series metadata.
          if (selectedSeriesIndex == null) {
            return '';
          }

          // The first item contains the label for the current x-axis value.
          const title = axisParams[0].axisValueLabel;

          // Keep only tooltip items belonging to the selected series.
          const hoveredParams = axisParams.filter(
            (param) => param.seriesIndex === selectedSeriesIndex,
          );

          // Turn each selected tooltip item into one line of HTML.
          const rows = hoveredParams
            .map((param) => {
              // Use the series index to find the matching series definition,
              // including its key and display name.
              const seriesMeta = dataset.series[param.seriesIndex];
              const row = param.data;
              const value = row?.[seriesMeta.key];

              // Formatted values are stored separately from the raw chart
              // values. Use the formatted value when available, otherwise
              // fall back to the raw value supplied by ECharts.
              const formattedValue =
                (param.dataIndex == null
                  ? undefined
                  : dataset.formattedValues[param.dataIndex]?.[
                      seriesMeta.key
                    ]) ?? value;
              const tooltipValue =
                formattedValue == null ? '' : `${formattedValue}`;

              // Repeat the available symbols when there are more series than
              // symbols, and use a fallback color if ECharts provides none.
              const symbol =
                LINE_SERIES_SYMBOLS[
                  param.seriesIndex % LINE_SERIES_SYMBOLS.length
                ];
              const color = param.color ?? '#666666';

              return `<div style="display:flex;align-items:flex-start;gap:6px;white-space:normal;overflow-wrap:anywhere"><span style="display:inline-flex;align-items:center;height:1.1em;flex:none">${getTooltipSymbolSvg(symbol, color)}</span><span style="min-width:0;overflow-wrap:anywhere;line-height:1.4em">${param.seriesName}: <strong>${tooltipValue}</strong></span></div>`;
            })
            .join('');

          // Add the x-axis title above the generated value rows and return the
          // complete HTML string that ECharts will render as the tooltip.
          return `<div style="font-family:${CHART_FONT_FAMILY}"><div style="margin-bottom:4px;">${title}</div>${rows}</div>`;
        },
      },
    };
  }, [
    dataset,
    resolvedColors,
    yAxisBreak,
    yAxisInterval,
    xAxisName,
    visibleLegendData,
    isMediumOrSmallerScreen,
  ]);

  const { divRef, chartRef } = useEChartOption(
    option,
    'svg',
    X_AXIS_LABEL_TO_LEGEND_GAP,
  );

  useEffect(() => {
    // ECharts creates the chart after the component renders. There is nothing
    // to subscribe to until that chart instance is available.
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    // Remember the series the user is interacting with so the tooltip can
    // show only that series on smaller screens.
    const handleSeriesInteraction = (params: {
      componentType?: string;
      seriesIndex?: number;
    }) => {
      if (
        params.componentType === 'series' &&
        typeof params.seriesIndex === 'number'
      ) {
        hoveredSeriesIndexRef.current = params.seriesIndex;
      }
    };

    // Once the pointer leaves the chart, allow the next interaction to choose
    // a series again.
    const handleGlobalOut = () => {
      hoveredSeriesIndexRef.current = null;
    };

    // On smaller screens, a click on the chart should show the tooltip for
    // the closest data row. ECharts gives us a pixel position, so we first
    // convert it to an x-axis position and then to a valid row index.
    const handleChartClick = (event: { offsetX: number; offsetY: number }) => {
      if (!isMediumOrSmallerScreen || dataset.source.length === 0) {
        return;
      }

      const axisCoordinate = chart.convertFromPixel(
        { xAxisIndex: 0 },
        event.offsetX,
      );

      if (typeof axisCoordinate !== 'number' || Number.isNaN(axisCoordinate)) {
        return;
      }

      // Rounding selects the closest category. Clamping prevents clicks near
      // the chart edges from producing an index outside the data array.
      const dataIndex = Math.max(
        0,
        Math.min(dataset.source.length - 1, Math.round(axisCoordinate)),
      );

      // If no series has been selected yet, use the first one.
      hoveredSeriesIndexRef.current ??= 0;

      // Ask ECharts to display the tooltip for the selected series and row.
      chart.dispatchAction({
        type: 'showTip',
        seriesIndex: hoveredSeriesIndexRef.current,
        dataIndex,
      });
    };

    // Register the handlers with ECharts and its lower-level rendering layer.
    chart.on('mouseover', handleSeriesInteraction);
    chart.on('click', handleSeriesInteraction);
    chart.on('globalout', handleGlobalOut);
    const zrender = chart.getZr?.();
    zrender?.on('click', handleChartClick);

    return () => {
      // Remove the handlers when the effect is rerun or the component is
      // unmounted, preventing duplicate events and stale chart references.
      chart.off('mouseover', handleSeriesInteraction);
      chart.off('click', handleSeriesInteraction);
      chart.off('globalout', handleGlobalOut);
      zrender?.off('click', handleChartClick);
    };
  }, [chartRef, option, dataset, isMediumOrSmallerScreen]);

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
            style={{
              width: '100%',
              height: `${height}rem`,
              touchAction: 'pan-y',
            }}
          ></div>
          {shouldShowLegendToggle && (
            <LegendToggleButton
              onClick={() => setIsLegendExpanded((current) => !current)}
              text={
                isLegendExpanded ? translations.showLess : translations.showMore
              }
              isExpanded={isLegendExpanded}
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
  readonly isExpanded: boolean;
}

export function LegendToggleButton({
  onClick,
  text,
  isExpanded,
}: LegendToggleButtonProps) {
  return (
    <>
      <div className={styles.divider}></div>
      <Button
        onClick={onClick}
        variant="secondary"
        size="medium"
        iconPosition="end"
        icon={isExpanded ? 'ChevronUp' : 'ChevronDown'}
        className={cl(styles.buttonWidth)}
      >
        {text}
      </Button>
    </>
  );
}
