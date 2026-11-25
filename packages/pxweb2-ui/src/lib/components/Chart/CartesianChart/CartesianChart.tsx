import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts';
import cl from 'clsx';

import styles from './CartesianChart.module.scss';
import { Button } from '../../Button/Button';
import {
  buildDatasetOption,
  buildSeriesOption,
} from '../Utils/chartOptionBuilder';
import { createActiveLineMarker } from '../Utils/chartActiveLineMarker';
import { getBarLegendSymbol } from '../Utils/chartSymbols';
import { getFallbackLegendHeight } from '../Utils/chartLegendHelper';
import { useEChartOption } from '../Utils/useEChartOption';
import {
  getAxisFontSize,
  getAxisLineHeight,
  createCategoryYAxisLabelConfig,
  getWrappedAxisNames,
  createRotatedAxisLabelConfig,
} from '../Utils/chartAxisLabelHelper';
import { useResponsivePixelsPerRem } from '../Utils/useResponsivePixelsPerRem';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import {
  getAdaptiveValueAxisMin,
  getAdaptiveValueAxisMax,
  getAdaptiveValueAxisInterval,
  getChartCssVariables,
  checkMultipleUnits,
  getValueAxisBreak,
} from '../Utils/chartHelper';
import {
  findClosestIsolatedLineSeries,
  formatChartTooltip,
  type PointerPosition,
} from '../Utils/chartTooltipHelper';
import EmptyState from '../../EmptyState/EmptyState';
import type { EmptyStateProps } from '../../EmptyState/EmptyState';
import type { PxTable } from '../../../shared-types/pxTable';
import type { ScreenSize } from '../../../types/screenSize';

// Pixel gap between the x-axis labels and the chart legend.
const X_AXIS_LABEL_TO_LEGEND_GAP = 16;
// Height of plot area in pixels for different screen sizes.
const CHART_PLOT_HEIGHT_PX: Record<ScreenSize, number> = {
  xxlarge: 680,
  xlarge: 542,
  large: 528,
  medium: 500,
  small: 400,
  xsmall: 300,
};
// Minimum height of a horizontal category row in pixels.
const MIN_HORIZONTAL_CATEGORY_ROW_HEIGHT_PX = 24;
// Aspect ratio of the chart's height relative to its width (ideal ratio).
const CHART_ASPECT_HEIGHT_PER_WIDTH = 9 / 16;
// Minimum plot height in pixels.
const MIN_PLOT_HEIGHT_PX = 280;
// Offset to subtract from the viewport height to determine the maximum plot height.
const VIEWPORT_HEIGHT_OFFSET_PX = 400;

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
  readonly numberFormatter?: (value: number) => string;
  readonly translations: ChartTranslations;
  readonly onChartReady?: (chart: ChartInstance | null) => void;
  readonly screenSize?: ScreenSize;
}

interface CartesianChartProps extends ChartProps {
  readonly seriesType: 'line' | 'bar';
  readonly orientation?: 'vertical' | 'horizontal';
  readonly breakValueAxis?: boolean;
  readonly getTooltipSymbolSvg: (color: string, seriesIndex: number) => string;
}

export function CartesianChart({
  pxtable,
  staticTitle,
  colors,
  emptyStateSvgName,
  numberFormatter,
  translations,
  onChartReady,
  screenSize = 'large',
  seriesType,
  orientation = 'vertical',
  breakValueAxis = false,
  getTooltipSymbolSvg,
}: CartesianChartProps) {
  const [isLegendExpanded, setIsLegendExpanded] = useState(false);

  // Chart dimensions state, including the chart width and the viewport height.
  // Used to calculate the chart's layout and aspect ratio based on the available width and viewport height.
  const [dimensions, setDimensions] = useState<{
    chartWidth: number | null;
    viewportHeight: number | null;
  }>({ chartWidth: null, viewportHeight: null });

  const { chartWidth, viewportHeight } = dimensions;
  
    // Handle changes in the chart width and update the dimensions state accordingly.
  const handleWidthChange = useCallback((chartWidth: number | null) => {
    const newDimensions = {
      chartWidth,
      viewportHeight: typeof window === 'undefined' ? null : window.innerHeight,
    };

    setDimensions((previous) => {
      if (
        previous.chartWidth === newDimensions.chartWidth &&
        previous.viewportHeight === newDimensions.viewportHeight
      ) {
        return previous;
      }

      return newDimensions;
    });
  }, []);

  // Stores the position of the chart series the user is currently hovering.
  // null means that no series has been selected yet. A ref is used because
  // this value is only needed by chart event handlers and the tooltip; changing
  // it should not cause the whole chart component to render again.
  const hoveredSeriesIndexRef = useRef<number | null>(null);
  
  // The tooltip formatter updates or clears this marker, which is created only
  // after ECharts is ready. A ref lets the formatter access the current marker
  // without triggering a React render.
  const activeLineMarkerRef = useRef<
    ReturnType<typeof createActiveLineMarker> | undefined
  >(undefined);
  
  const hasMultipleUnits = checkMultipleUnits(pxtable);
  const isHorizontal = seriesType === 'bar' && orientation === 'horizontal';
  const isMediumOrSmallerScreen =
    screenSize === 'medium' ||
    screenSize === 'small' ||
    screenSize === 'xsmall';
  const isSmallScreen = screenSize === 'small' || screenSize === 'xsmall';

  const categoryAxisName = useMemo(() => {
    return pxtable.stub.map((variable) => variable.label).join(' / ');
  }, [pxtable]);

  const resolvedColors = useMemo(() => {
    return colors && colors.length > 0
      ? colors
      : getChartCssVariables()?.chartColors;
  }, [colors]);

  const resolvedEmptyStateTitle =
    translations.emptyStateTitle?.trim() || 'The chart cannot be displayed';
  const resolvedEmptyStateDescription =
    translations.emptyStateDescription?.trim() ||
    `Different units are selected in the filter. These cannot be displayed in the same chart.`;
  const resolvedEmptyStateSvgName: EmptyStateProps['svgName'] =
    emptyStateSvgName && emptyStateSvgName.trim().length > 0
      ? emptyStateSvgName
      : 'ManWithMagnifyingGlass';

  const dataset = useMemo(() => mapPxTableToChartDataset(pxtable), [pxtable]);
  const resolvedNumberFormatter = useMemo(
    () =>
      numberFormatter ??
      new Intl.NumberFormat(pxtable.metadata?.language).format,
    [pxtable.metadata?.language, numberFormatter],
  );
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

  const valueAxisValues = useMemo(() => {
    return dataset.source
      .flatMap((row) => dataset.series.map((series) => row[series.key]))
      .filter((value): value is number => typeof value === 'number');
  }, [dataset]);

  // Calculate the data extent for the value-axis (min and max) based on the available values.
  const valueAxisDataExtent = useMemo(() => {
    if (valueAxisValues.length === 0) {
      return undefined;
    }

    let min = valueAxisValues[0];
    let max = valueAxisValues[0];

    for (let index = 1; index < valueAxisValues.length; index += 1) {
      const value = valueAxisValues[index];
      min = Math.min(min, value);
      max = Math.max(max, value);
    }

    return { min, max };
  }, [valueAxisValues]);

  const valueAxisBreak = useMemo(() => {
    if (!breakValueAxis || !valueAxisDataExtent) {
      return undefined;
    }

    return getValueAxisBreak(valueAxisDataExtent);
  }, [breakValueAxis, valueAxisDataExtent]);

  const valueAxisInterval = useMemo(() => {
    if (!valueAxisBreak || !valueAxisDataExtent) {
      return undefined;
    }

    return getAdaptiveValueAxisInterval(valueAxisDataExtent);
  }, [valueAxisBreak, valueAxisDataExtent]);

  const pixelsPerRem = useResponsivePixelsPerRem();
  const axisFontSize = getAxisFontSize(pixelsPerRem);
  const axisLineHeight = getAxisLineHeight(axisFontSize);

  const { wrappedCategoryAxisName, wrappedValueAxisName } = useMemo(
    () =>
      getWrappedAxisNames(
        categoryAxisName,
        dataset.unit,
        isHorizontal,
        axisFontSize,
      ),
    [categoryAxisName, dataset.unit, isHorizontal, axisFontSize],
  );

  // Create a configuration for rotated axis labels.
  const rotatedAxisLabelConfig = useMemo(
    () => createRotatedAxisLabelConfig(axisFontSize, axisLineHeight),
    [axisFontSize, axisLineHeight],
  );
  // When category labels are displayed on the Y-axis, we need to create a configuration for wrapping and measuring them.
  const categoryYAxisLabelConfig = useMemo(
    () =>
      createCategoryYAxisLabelConfig(screenSize, axisFontSize, axisLineHeight),
    [axisFontSize, screenSize, axisLineHeight],
  );
  const categoryLabels = useMemo(
    () => dataset.source.map((row) => row.name),
    [dataset.source],
  );
  const categoryLabelWidth = useMemo(
    () => categoryYAxisLabelConfig.estimateWidth(categoryLabels),
    [categoryYAxisLabelConfig, categoryLabels],
  );
  const categoryLabelHeight = useMemo(
    () =>
      isHorizontal
        ? categoryYAxisLabelConfig.estimateHeight(categoryLabels)
        : rotatedAxisLabelConfig.estimateHeight(categoryLabels),
    [
      isHorizontal,
      categoryYAxisLabelConfig,
      rotatedAxisLabelConfig,
      categoryLabels,
    ],
  );
  const xAxisLabelsHeight = isHorizontal ? 0 : categoryLabelHeight;
  const horizontalRowHeight = Math.max(
    MIN_HORIZONTAL_CATEGORY_ROW_HEIGHT_PX,
    categoryLabelHeight + 8,
  );
  // Minimum height for horizontal charts based on the number of rows and row height.
  const horizontalMinimumHeightPx =
    dataset.source.length * horizontalRowHeight + X_AXIS_LABEL_TO_LEGEND_GAP;

  // Fallback plot height for the chart, considering horizontal minimum height if applicable.
  const fallbackPlotHeightPx = isHorizontal
    ? Math.max(CHART_PLOT_HEIGHT_PX[screenSize], horizontalMinimumHeightPx)
    : CHART_PLOT_HEIGHT_PX[screenSize];

  // Base plot height for the chart, calculated from chart width and aspect ratio.
  const basePlotHeightPx =
    chartWidth === null
      ? CHART_PLOT_HEIGHT_PX[screenSize]
      : chartWidth * CHART_ASPECT_HEIGHT_PER_WIDTH;

  // Chart plot height for horizontal and vertical orientations.
  const chartPlotHeightHorizontalPx = Math.max(basePlotHeightPx, horizontalMinimumHeightPx);
  const chartPlotHeightVerticalPx = Math.max(
        MIN_PLOT_HEIGHT_PX,
        viewportHeight === null
          ? basePlotHeightPx
          : Math.min(
              basePlotHeightPx,
              viewportHeight - VIEWPORT_HEIGHT_OFFSET_PX,
            ),
      );

  // Select the appropriate chart plot height based on orientation.
  const chartPlotHeightPx = isHorizontal
    ? chartPlotHeightHorizontalPx
    : chartPlotHeightVerticalPx;

  // Convert chart plot height from pixels to rem units.
  const chartPlotHeightRem = chartPlotHeightPx / pixelsPerRem;

  // Grid height for the chart, ensuring it is non-negative and accounts for X-axis labels.
  const gridHeight = Math.max(
    0,
    chartPlotHeightPx - X_AXIS_LABEL_TO_LEGEND_GAP + xAxisLabelsHeight,
  );

  // Bar charts with no negative values start at zero; a line-chart axis break
  // also requires a zero minimum. Otherwise, use the adaptive minimum so
  // negative values remain visible.
  const valueAxisZeroBased = seriesType === 'bar';
  const valueAxisShouldBeZeroBased =
    (valueAxisZeroBased &&
      valueAxisDataExtent !== undefined &&
      valueAxisDataExtent.min >= 0) ||
    valueAxisBreak;
  const valueAxisMin = valueAxisShouldBeZeroBased ? 0 : getAdaptiveValueAxisMin;

  const option = useMemo<echarts.EChartsOption>(() => {
    const fallbackLegendHeight = getFallbackLegendHeight(visibleLegendData);
    const series = buildSeriesOption(dataset, seriesType, resolvedColors).map(
      (seriesOption, index) => ({
        ...seriesOption,
        emphasis: {
          ...seriesOption.emphasis,
          ...(isMediumOrSmallerScreen
            ? { disabled: true }
            : { focus: 'series' as const }),
        },
        encode: isHorizontal
          ? { x: dataset.series[index].key, y: 'name' }
          : { x: 'name', y: dataset.series[index].key },
      }),
    ) as echarts.EChartsOption['series'];

    const fallbackGridHeight = Math.max(
      0,
      fallbackPlotHeightPx - X_AXIS_LABEL_TO_LEGEND_GAP + xAxisLabelsHeight,
    );

    const valueAxisBreakOptions = valueAxisBreak
      ? {
          breaks: [valueAxisBreak],
          breakArea: { show: false },
        }
      : {};

    return {
      ...buildDatasetOption(dataset),
      grid: {
        top: 0,
        height: fallbackGridHeight,
        bottom: fallbackLegendHeight + X_AXIS_LABEL_TO_LEGEND_GAP,
        left: 0,
        right: 0,
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

      xAxis: isHorizontal
        ? {
            type: 'value' as const,
            name: wrappedValueAxisName,
            axisLabel: isSmallScreen
              ? {
                  fontSize: axisFontSize,
                  rotate: 45,
                  interval: 0,
                  align: 'right',
                  lineHeight: axisLineHeight,
                  verticalAlign: 'top',
                  overflow: 'break',
                  hideOverlap: true,
                  formatter: (value: string | number) =>
                    rotatedAxisLabelConfig.formatter(
                      value,
                      resolvedNumberFormatter,
                    ),
                }
              : {
                  fontSize: axisFontSize,
                  hideOverlap: true,
                  formatter: (value: string | number) =>
                    resolvedNumberFormatter(Number(value)),
                },
            nameTextStyle: {
              fontSize: axisFontSize,
              lineHeight: axisLineHeight,
            },
            scale: false,
            min: valueAxisMin,
            max: (value) => getAdaptiveValueAxisMax(value, valueAxisZeroBased),
            axisLine: { show: true },
            axisTick: { show: true },
          }
        : {
            type: 'category' as const,
            name: wrappedCategoryAxisName,
            nameLocation: 'end',
            // Keeps the axis name clear of the rotated labels instead of using a hardcoded nameGap.
            nameMoveOverlap: true,
            nameTextStyle: {
              fontSize: axisFontSize,
              lineHeight: axisLineHeight,
            },
            axisLabel: {
              fontSize: axisFontSize,
              rotate: 45,
              interval: 0,
              align: 'right',
              lineHeight: axisLineHeight,
              verticalAlign: 'top',
              overflow: 'break',
              hideOverlap: true,
              formatter: (value: string | number) =>
                rotatedAxisLabelConfig.formatter(value),
            },
            axisLine: {
              show: true,
              onZero: false,
            },
            axisTick: { show: true, alignWithLabel: true },
          },
      yAxis: isHorizontal
        ? {
            type: 'category' as const,
            name: wrappedCategoryAxisName,
            inverse: true,
            nameLocation: 'start',
            nameTextStyle: {
              fontSize: axisFontSize,
              lineHeight: axisLineHeight,
            },
            axisLabel: {
              fontSize: axisFontSize,
              width: Math.max(1, categoryLabelWidth),
              lineHeight: axisLineHeight,
              align: 'right',
              formatter: categoryYAxisLabelConfig.formatter,
            },
            axisLine: { show: true, onZero: false },
            axisTick: { show: true, alignWithLabel: true },
          }
        : {
            name: wrappedValueAxisName,
            axisLabel: {
              fontSize: axisFontSize,
              formatter: (value: string | number) =>
                resolvedNumberFormatter(Number(value)),
            },
            nameTextStyle: {
              fontSize: axisFontSize,
              lineHeight: axisLineHeight,
            },
            scale: false,
            min: valueAxisMin,
            max: (value) => getAdaptiveValueAxisMax(value, valueAxisZeroBased),
            interval: valueAxisInterval,
            ...valueAxisBreakOptions,
            axisLine: {
              show: true,
              breakLine: false,
            },
            axisTick: { show: true },
          },
      legend: {
        data: visibleLegendData,
        ...(seriesType === 'bar' ? { icon: getBarLegendSymbol() } : {}),
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
        formatter: (params: unknown) =>
          formatChartTooltip(
            params,
            dataset,
            hoveredSeriesIndexRef.current,
            isMediumOrSmallerScreen,
            {
              tooltipContent: styles.tooltipContent,
              tooltipMarker: styles.tooltipMarker,
              tooltipRow: styles.tooltipRow,
              tooltipSeries: styles.tooltipSeries,
              tooltipTitle: styles.tooltipTitle,
            },
            getTooltipSymbolSvg,
            (point) => activeLineMarkerRef.current?.update(point), // Update the active line marker with the currently hovered tooltip point
          ),
      },
    };
  }, [
    visibleLegendData,
    dataset,
    seriesType,
    isHorizontal,
    resolvedColors,
    xAxisLabelsHeight,
    isSmallScreen,
    chartTitle,
    chartSourcePart1,
    staticTitle,
    wrappedCategoryAxisName,
    wrappedValueAxisName,
    axisFontSize,
    axisLineHeight,
    rotatedAxisLabelConfig,
    categoryYAxisLabelConfig,
    categoryLabelWidth,
    fallbackPlotHeightPx,
    resolvedNumberFormatter,
    valueAxisMin,
    valueAxisInterval,
    valueAxisBreak,
    isMediumOrSmallerScreen,
    valueAxisZeroBased,
    getTooltipSymbolSvg,
  ]);

  const { divRef, chartRef, estimatedLegendHeight } = useEChartOption(
    option,
    'svg',
    !hasMultipleUnits,
    handleWidthChange,
    gridHeight,
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
  }, [chartRef, option, onChartReady, hasMultipleUnits]);

  useEffect(() => {
    // ECharts creates the chart after the component renders. There is nothing
    // to subscribe to until that chart instance is available.
    const chart = chartRef.current;
    if (!chart) {
      return;
    }

    const zrender = chart.getZr?.();
    const activeLineMarker =
      seriesType === 'line'
        ? createActiveLineMarker(chart, dataset)
        : undefined;
    activeLineMarkerRef.current = activeLineMarker;
    if (activeLineMarker) {
      chart.on('hideTip', activeLineMarker.clear);
      chart.on('finished', activeLineMarker.reposition);
      chart.on('legendselectchanged', activeLineMarker.clear);
    }

    // Remember the series the user is interacting with so the tooltip can
    // show only that series on smaller screens.
    const handleSeriesInteraction = (params: {
      componentType?: string;
      seriesIndex?: number;
      event?: PointerPosition;
    }) => {
      if (
        params.componentType === 'series' &&
        typeof params.seriesIndex === 'number'
      ) {
        const seriesChanged =
          hoveredSeriesIndexRef.current !== params.seriesIndex;
        hoveredSeriesIndexRef.current = params.seriesIndex;
        if (seriesType === 'line' && seriesChanged && params.event) {
          // ECharts can cache the axis tooltip before the hovered line changes.
          chart.dispatchAction({ type: 'hideTip' });
          chart.dispatchAction({
            type: 'showTip',
            x: params.event.offsetX,
            y: params.event.offsetY,
          });
        }
      }
    };

    // Once the pointer leaves the chart, allow the next interaction to choose
    // a series again.
    const handleGlobalOut = () => {
      hoveredSeriesIndexRef.current = null;
      activeLineMarker?.clear();
    };

    // Isolated values have neither a visible marker nor a line to hit.
    const handleIsolatedLinePoint = (event: PointerPosition) => {
      const axisCoordinate = chart.convertFromPixel(
        { xAxisIndex: 0 },
        event.offsetX,
      );
      if (
        typeof axisCoordinate !== 'number' ||
        !Number.isFinite(axisCoordinate)
      ) {
        return;
      }

      const dataIndex = Math.round(axisCoordinate);
      const row = dataset.source[dataIndex];
      if (!row) {
        return;
      }

      const closestSeriesIndex = findClosestIsolatedLineSeries(
        chart,
        dataset,
        dataIndex,
        row,
        event,
      );
      if (closestSeriesIndex === undefined) {
        return;
      }

      if (hoveredSeriesIndexRef.current !== closestSeriesIndex) {
        hoveredSeriesIndexRef.current = closestSeriesIndex;
        chart.dispatchAction({ type: 'hideTip' });
      }
      chart.dispatchAction({
        type: 'showTip',
        seriesIndex: closestSeriesIndex,
        dataIndex,
      });
    };

    // On smaller screens, a click on the chart should show the tooltip for
    // the closest data row. Convert the pointer coordinate along the category
    // axis to a valid row index.
    const handleChartClick = (event: PointerPosition) => {
      if (!isMediumOrSmallerScreen || dataset.source.length === 0) {
        return;
      }

      const axisFinder = isHorizontal ? { yAxisIndex: 0 } : { xAxisIndex: 0 };
      const pointerCoordinate = isHorizontal ? event.offsetY : event.offsetX;
      const axisCoordinate = chart.convertFromPixel(
        axisFinder,
        pointerCoordinate,
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
    if (seriesType === 'line') {
      chart.on('mousemove', handleSeriesInteraction);
    }
    chart.on('mouseover', handleSeriesInteraction);
    chart.on('click', handleSeriesInteraction);
    chart.on('globalout', handleGlobalOut);
    if (seriesType === 'line') {
      zrender?.on('mousemove', handleIsolatedLinePoint);
      zrender?.on('click', handleIsolatedLinePoint);
    }
    zrender?.on('click', handleChartClick);

    return () => {
      // Remove the handlers when the effect is rerun or the component is
      // unmounted, preventing duplicate events and stale chart references.
      activeLineMarkerRef.current = undefined;
      if (!chart.isDisposed()) {
        if (activeLineMarker) {
          chart.off('hideTip', activeLineMarker.clear);
          chart.off('finished', activeLineMarker.reposition);
          chart.off('legendselectchanged', activeLineMarker.clear);
        }
        if (seriesType === 'line') {
          chart.off('mousemove', handleSeriesInteraction);
        }
        chart.off('mouseover', handleSeriesInteraction);
        chart.off('click', handleSeriesInteraction);
        chart.off('globalout', handleGlobalOut);
      }
      activeLineMarker?.dispose();
      if (seriesType === 'line') {
        zrender?.off('mousemove', handleIsolatedLinePoint);
        zrender?.off('click', handleIsolatedLinePoint);
      }
      zrender?.off('click', handleChartClick);
    };
  }, [
    chartRef,
    option,
    dataset,
    isMediumOrSmallerScreen,
    isHorizontal,
    hasMultipleUnits,
    seriesType,
  ]);

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
      <div className={styles.legendButtonDivider}></div>
      <Button
        onClick={onClick}
        variant="secondary"
        size="medium"
        iconPosition="end"
        icon={isExpanded ? 'ChevronUp' : 'ChevronDown'}
        className={cl(styles.legendButton)}
      >
        {text}
      </Button>
    </>
  );
}
