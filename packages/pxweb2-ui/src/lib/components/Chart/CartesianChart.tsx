import { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import cl from 'clsx';

import styles from './CartesianChart.module.scss';
import { Button } from '../Button/Button';
import {
  buildDatasetOption,
  buildSeriesOption,
} from './Utils/chartOptionBuilder';
import { getFallbackLegendHeight } from './Utils/chartLegendHelper';
import { useEChartOption } from './Utils/useEChartOption';
import {
  createResponsiveXAxisLabelConfig,
  wrapAxisName,
} from './Utils/chartAxisLabelHelper';
import { useResponsivePixelsPerRem } from './Utils/useResponsivePixelsPerRem';
import { mapPxTableToChartDataset } from './Utils/chartDataMapper';
import {
  getAdaptiveYAxisMin,
  getAdaptiveYAxisMax,
  getAdaptiveYAxisInterval,
  getChartCssVariables,
  checkMultipleUnits,
  getYAxisBreak,
} from './Utils/chartHelper';
import EmptyState from '../EmptyState/EmptyState';
import type { EmptyStateProps } from '../EmptyState/EmptyState';
import type { PxTable } from '../../shared-types/pxTable';
import type { ScreenSize } from '../../types/screenSize';

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

// Pixel gap between the x-axis labels and the chart legend.
const X_AXIS_LABEL_TO_LEGEND_GAP = 16;
// Pixel padding above the plot area.
const TOP_CHART_PADDING = 36;
// Base font size in rem, converted to pixels for axis-name wrapping.
const CHART_FONT_SIZE_REM = 0.875;
// Maximum pixel width before the x-axis name is wrapped onto another line.
const X_AXIS_NAME_MAX_WIDTH_PX = 100;
// Maximum pixel width before the y-axis name is wrapped onto another line.
const Y_AXIS_NAME_MAX_WIDTH_PX = 200;
// Height of plot area in pixels for different screen sizes.
const CHART_PLOT_HEIGHT_PX: Record<ScreenSize, number> = {
  xxlarge: 680,
  xlarge: 542,
  large: 528,
  medium: 500,
  small: 400,
  xsmall: 300,
};

export type ChartInstance = echarts.EChartsType;

export interface ChartTranslations {
  readonly showMore: string;
  readonly showLess: string;
  readonly emptyStateTitle: string;
  readonly emptyStateDescription: string;
}

export interface ChartProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
  readonly colors?: string[];
  readonly emptyStateSvgName?: EmptyStateProps['svgName'];
  readonly translations: ChartTranslations;
  readonly onChartReady?: (chart: ChartInstance | null) => void;
  readonly screenSize?: ScreenSize;
}

interface CartesianChartProps extends ChartProps {
  readonly seriesType: 'line' | 'bar';
  readonly breakValueAxis?: boolean;
  readonly getTooltipSymbolSvg: (color: string, seriesIndex: number) => string;
}

export function CartesianChart({
  pxtable,
  staticTitle,
  colors,
  emptyStateSvgName,
  translations,
  onChartReady,
  screenSize = 'large',
  seriesType,
  breakValueAxis = false,
  getTooltipSymbolSvg,
}: CartesianChartProps) {
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);
  // Stores the position of the chart series the user is currently hovering.
  // null means that no series has been selected yet. A ref is used because
  // this value is only needed by chart event handlers and the tooltip; changing
  // it should not cause the whole chart component to render again.
  const hoveredSeriesIndexRef = useRef<number | null>(null);
  const hasMultipleUnits = checkMultipleUnits(pxtable);
  const isMediumOrSmallerScreen =
    screenSize === 'medium' ||
    screenSize === 'small' ||
    screenSize === 'xsmall';
  const isSmallScreen = screenSize === 'small' || screenSize === 'xsmall';

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
    `The ${seriesType} chart cannot be displayed because your selection includes contents with different units (for example number and percent). Please select contents with the same unit to see the ${seriesType} chart.`;
  const resolvedEmptyStateSvgName: EmptyStateProps['svgName'] =
    emptyStateSvgName && emptyStateSvgName.trim().length > 0
      ? emptyStateSvgName
      : 'ManWithMagnifyingGlass';

  const dataset = useMemo(() => mapPxTableToChartDataset(pxtable), [pxtable]);
  const hasLegendOverflow = dataset.series.length > 5;
  const shouldShowLegendToggle = hasLegendOverflow && isMediumOrSmallerScreen;
  const shouldShowLimitedLegend = shouldShowLegendToggle && !isLegendExpanded;
  const chartTitle = dataset.title;
  const chartSourcePart1 = dataset.origin;
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

  // Calculate the data extent for the Y-axis (min and max) based on the available values.
  const yAxisDataExtent = useMemo(() => {
    if (yAxisValues.length === 0) {
      return undefined;
    }

    let min = yAxisValues[0];
    let max = yAxisValues[0];

    for (let index = 1; index < yAxisValues.length; index += 1) {
      const value = yAxisValues[index];
      min = Math.min(min, value);
      max = Math.max(max, value);
    }

    return { min, max };
  }, [yAxisValues]);

  const yAxisBreak = useMemo(() => {
    if (!breakValueAxis || !yAxisDataExtent) {
      return undefined;
    }

    return getYAxisBreak(yAxisDataExtent);
  }, [breakValueAxis, yAxisDataExtent]);

  const yAxisInterval = useMemo(() => {
    if (!yAxisBreak || !yAxisDataExtent) {
      return undefined;
    }

    return getAdaptiveYAxisInterval(yAxisDataExtent);
  }, [yAxisBreak, yAxisDataExtent]);

  const pixelsPerRem = useResponsivePixelsPerRem();
  const axisNameFontSizePx = pixelsPerRem * CHART_FONT_SIZE_REM;
  const wrappedXAxisName = useMemo(
    () => wrapAxisName(xAxisName, X_AXIS_NAME_MAX_WIDTH_PX, axisNameFontSizePx),
    [xAxisName, axisNameFontSizePx],
  );
  const wrappedYAxisName = useMemo(
    () =>
      wrapAxisName(dataset.unit, Y_AXIS_NAME_MAX_WIDTH_PX, axisNameFontSizePx),
    [dataset.unit, axisNameFontSizePx],
  );
  const xAxisLabelConfig = useMemo(
    () => createResponsiveXAxisLabelConfig(pixelsPerRem),
    [pixelsPerRem],
  );
  const xAxisLabelsHeight = xAxisLabelConfig.estimateHeight(
    dataset.source.map((row) => row.name),
  );
  const chartPlotHeightRem = CHART_PLOT_HEIGHT_PX[screenSize] / pixelsPerRem;
  // Bar charts with no negative values start at zero; a line-chart axis break
  // also requires a zero minimum. Otherwise, use the adaptive minimum so
  // negative values remain visible.
  const yAxisMin =
    (seriesType === 'bar' &&
      yAxisDataExtent !== undefined &&
      yAxisDataExtent.min >= 0) ||
    yAxisBreak
      ? 0
      : getAdaptiveYAxisMin;

  const option = useMemo<echarts.EChartsOption>(() => {
    const fallbackLegendHeight = getFallbackLegendHeight(visibleLegendData);
    const series = buildSeriesOption(dataset, seriesType, resolvedColors).map(
      (seriesOption) => ({
        ...seriesOption,
        emphasis: isMediumOrSmallerScreen
          ? { disabled: true }
          : { focus: 'series' as const },
      }),
    ) as echarts.EChartsOption['series'];
    const gridHeight =
      CHART_PLOT_HEIGHT_PX[screenSize] -
      TOP_CHART_PADDING -
      X_AXIS_LABEL_TO_LEGEND_GAP +
      xAxisLabelsHeight;

    return {
      ...buildDatasetOption(dataset),
      grid: {
        top: TOP_CHART_PADDING,
        height: gridHeight,
        bottom: fallbackLegendHeight + X_AXIS_LABEL_TO_LEGEND_GAP,
        left: isSmallScreen ? 48 : '0',
        right: '0',
        //'same' keeps axis labels inside the grid rect
        outerBoundsMode: 'same',
        // 'all' keeps the axis names inside the grid rect
        outerBoundsContain: 'all',
      },
      title: [
        {
          text: chartTitle,
          left: 'left',
          show: false,
          top: 'top',
        },
        {
          text: chartSourcePart1,
          subtext: staticTitle,
          left: 'left',
          show: false,
          bottom: '0',
        },
      ],

      xAxis: {
        type: 'category' as const,
        name: wrappedXAxisName,
        nameLocation: 'end',
        // Keeps the axis name clear of the rotated labels instead of using a hardcoded nameGap.
        nameMoveOverlap: true,
        nameTextStyle: {
          lineHeight: xAxisLabelConfig.lineHeight,
        },
        axisLabel: {
          rotate: 45,
          interval: 0,
          align: 'right',
          lineHeight: xAxisLabelConfig.lineHeight,
          verticalAlign: 'top',
          overflow: 'break',
          hideOverlap: true,
          formatter: xAxisLabelConfig.formatter,
        },
        axisLine: {
          show: true,
          onZero: false,
        },
        axisTick: { show: true, alignWithLabel: true },
      },
      yAxis: {
        name: wrappedYAxisName,
        nameTextStyle: {
          lineHeight: xAxisLabelConfig.lineHeight,
        },
        scale: false,
        min: yAxisMin,
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
        orient: 'horizontal',
        textStyle: {
          overflow: 'break',
        },
      },
      series,
      tooltip: {
        trigger: 'axis',
        triggerOn: 'mousemove|click|mousewheel',
        confine: true,
        appendToBody: true,
        className: styles.tooltip,
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
              const color = param.color ?? '#666666';

              return `<div class="${styles.tooltipRow}"><span class="${styles.tooltipMarker}">${getTooltipSymbolSvg(color, param.seriesIndex)}</span><span class="${styles.tooltipSeries}">${param.seriesName}: <strong>${tooltipValue}</strong></span></div>`;
            })
            .join('');

          // Add the x-axis title above the generated value rows and return the
          // complete HTML string that ECharts will render as the tooltip.
          return `<div class="${styles.tooltipContent}"><div class="${styles.tooltipTitle}">${title}</div>${rows}</div>`;
        },
      },
    };
  }, [
    visibleLegendData,
    dataset,
    seriesType,
    resolvedColors,
    screenSize,
    xAxisLabelsHeight,
    chartTitle,
    chartSourcePart1,
    staticTitle,
    wrappedXAxisName,
    xAxisLabelConfig.lineHeight,
    xAxisLabelConfig.formatter,
    wrappedYAxisName,
    yAxisMin,
    yAxisInterval,
    yAxisBreak,
    isSmallScreen,
    isMediumOrSmallerScreen,
    getTooltipSymbolSvg,
  ]);

  const { divRef, chartRef, estimatedLegendHeight } = useEChartOption(
    option,
    'svg',
  );

  const calculatedLegendHeight =
    estimatedLegendHeight ?? getFallbackLegendHeight(visibleLegendData);

  const height =
    chartPlotHeightRem +
    (xAxisLabelsHeight + X_AXIS_LABEL_TO_LEGEND_GAP + calculatedLegendHeight) /
      pixelsPerRem;

  // Run callback function to set reference  current chart Let the parent access the chart instance, then clear it when this effect reruns or unmounts.
  // Presentation.tsx send callback function to set the chart reference.
  // DrawerSave.tsx use chart reference to save the chart as an image.
  useEffect(() => {
    onChartReady?.(chartRef.current);

    return () => {
      onChartReady?.(null);
    };
  }, [chartRef, option, onChartReady]);

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
