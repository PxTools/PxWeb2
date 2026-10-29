import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import * as echarts from 'echarts';

import { CartesianChart, LegendToggleButton } from './CartesianChart';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import { useEChartOption } from '../Utils/useEChartOption';
import {
  buildDatasetOption,
  buildSeriesOption,
} from '../Utils/chartOptionBuilder';
import {
  getChartCssVariables,
  getAdaptiveYAxisInterval,
  getAdaptiveYAxisMin,
  checkMultipleUnits,
  getYAxisBreak,
} from '../Utils/chartHelper';
import { createResponsiveXAxisLabelConfig } from '../Utils/chartAxisLabelHelper';
import * as Icons from '../../Icon/Icons';
import type { EChartsDataset } from '../Utils/chartTypes';
import type { PxTable } from '../../../shared-types/pxTable';

vi.mock('../Utils/chartDataMapper', () => ({
  mapPxTableToChartDataset: vi.fn(),
}));

vi.mock('../Utils/useEChartOption', () => ({
  applyYAxisBreakMark: vi.fn(),
  useEChartOption: vi.fn(),
}));

vi.mock('../Utils/chartLegendHelper', () => ({
  getFallbackLegendHeight: vi.fn(() => 120),
}));

vi.mock('../Utils/chartOptionBuilder', async () => {
  const actual = await vi.importActual<
    typeof import('../Utils/chartOptionBuilder')
  >('../Utils/chartOptionBuilder');

  return {
    ...actual,
    buildDatasetOption: vi.fn(),
    buildSeriesOption: vi.fn(),
  };
});

vi.mock('../Utils/chartHelper', () => ({
  getChartCssVariables: vi.fn(),
  getAdaptiveYAxisMin: vi.fn(),
  getAdaptiveYAxisMax: vi.fn(),
  getAdaptiveYAxisInterval: vi.fn(),
  getYAxisBreak: vi.fn(),
  checkMultipleUnits: vi.fn(),
}));

const mockDataset: EChartsDataset = {
  title: 'Population by year',
  origin: 'Statistics Demo',
  unit: 'persons',
  dimensions: ['name', 'men', 'women'],
  source: [{ name: '2024', men: 10, women: 12 }],
  formattedValues: [{ men: '10', women: '12' }],
  series: [
    { key: 'men', name: 'Men' },
    { key: 'women', name: 'Women' },
    { key: 'total', name: 'Total' },
  ],
};
const mockTranslations = {
  showMore: 'Show more',
  showLess: 'Show less',
  emptyStateTitle: 'Cannot display chart',
  emptyStateDescription:
    'The chart cannot be displayed because your selection includes contents with different units.',
};
const mockPxTable = {
  stub: [{ label: 'Year' }],
} as PxTable;

function renderChart(
  overrides: Partial<Parameters<typeof CartesianChart>[0]> = {},
) {
  return render(
    <CartesianChart
      pxtable={mockPxTable}
      translations={mockTranslations}
      staticTitle="Static title"
      seriesType="bar"
      getTooltipSymbolSvg={(color) => `<marker fill="${color}" />`}
      {...overrides}
    />,
  );
}

function getTooltipFormatter(option: { tooltip?: unknown }) {
  const tooltip = Array.isArray(option.tooltip)
    ? option.tooltip[0]
    : option.tooltip;

  if (!tooltip || typeof tooltip !== 'object' || !('formatter' in tooltip)) {
    return undefined;
  }

  const formatter = tooltip.formatter;
  return typeof formatter === 'function'
    ? (formatter as (params: unknown) => string)
    : undefined;
}

describe('CartesianChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(checkMultipleUnits).mockReturnValue(false);
    vi.mocked(mapPxTableToChartDataset).mockReturnValue(mockDataset);
    vi.mocked(buildDatasetOption).mockReturnValue({
      dataset: {
        dimensions: mockDataset.dimensions,
        source: mockDataset.source,
      },
      legend: {},
      tooltip: {},
    });
    vi.mocked(buildSeriesOption).mockReturnValue([
      { name: 'Men', type: 'bar' },
      { name: 'Women', type: 'bar' },
      { name: 'Total', type: 'bar' },
    ]);
    vi.mocked(getChartCssVariables).mockReturnValue({
      chartColors: ['#333333', '#444444'],
      axisColor: undefined,
      fontColor: undefined,
    });
    vi.mocked(getYAxisBreak).mockReturnValue({ start: 0, end: 9.7, gap: '48' });
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: { current: null },
      estimatedLegendHeight: null,
    });
  });

  it('builds chart options from the mapped dataset and provided colors', () => {
    const colors = ['#111111', '#222222'];

    renderChart({ colors });

    expect(mapPxTableToChartDataset).toHaveBeenCalledWith(mockPxTable);
    expect(buildDatasetOption).toHaveBeenCalledWith(mockDataset);
    expect(buildSeriesOption).toHaveBeenCalledWith(mockDataset, 'bar', colors);
    expect(getChartCssVariables).not.toHaveBeenCalled();
    expect(getYAxisBreak).not.toHaveBeenCalled();

    const option = vi.mocked(useEChartOption).mock.calls[0][0];

    expect(option.legend).toEqual({
      data: ['Men', 'Women', 'Total'],
      orient: 'horizontal',
      textStyle: { overflow: 'break' },
    });
    expect(option.yAxis).toMatchObject({ min: 0 });
    expect(option.yAxis).not.toHaveProperty('breaks');
    expect(
      (option.yAxis as echarts.YAXisComponentOption).name?.replaceAll(
        '\n',
        ' ',
      ),
    ).toBe(mockDataset.unit);
    expect(option.xAxis).toMatchObject({ axisLine: { onZero: false } });
    const labelHeight = createResponsiveXAxisLabelConfig(16).estimateHeight([
      '2024',
    ]);
    expect(option.grid).toEqual({
      top: 36,
      height: 476 + labelHeight,
      bottom: 136,
      left: '0',
      right: '0',
      outerBoundsContain: 'all',
      outerBoundsMode: 'same',
    });
    expect(option.tooltip).toMatchObject({
      trigger: 'axis',
      className: expect.any(String),
    });
    expect(option.series).toEqual([
      expect.objectContaining({ emphasis: { focus: 'series' } }),
      expect.objectContaining({ emphasis: { focus: 'series' } }),
      expect.objectContaining({ emphasis: { focus: 'series' } }),
    ]);
  });

  it('starts the bar chart y-axis at zero when all values are positive', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValueOnce({
      ...mockDataset,
      source: [{ name: '2024', men: 10, women: 12 }],
    });

    renderChart();

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    expect(option.yAxis).toMatchObject({ min: 0 });
    expect(option.yAxis).not.toHaveProperty('breaks');
  });

  it('uses the adaptive y-axis minimum for bar charts with negative values', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValueOnce({
      ...mockDataset,
      source: [{ name: '2024', men: -10, women: 12 }],
    });

    renderChart();

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    expect(option.yAxis).toMatchObject({ min: getAdaptiveYAxisMin });
    expect(option.yAxis).not.toHaveProperty('breaks');
  });

  it('sets an adaptive y-axis interval for negative values', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValueOnce({
      ...mockDataset,
      source: [
        { name: '2020', men: -1216, women: -262, total: 3498 },
        { name: '2021', men: 4190, women: 7090, total: 0 },
      ],
    });
    vi.mocked(getYAxisBreak).mockReturnValueOnce(undefined);
    vi.mocked(getAdaptiveYAxisInterval).mockReturnValueOnce(5000);

    renderChart({ seriesType: 'line' });

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    expect(getAdaptiveYAxisInterval).toHaveBeenCalledWith({
      min: -1216,
      max: 7090,
    });
    expect(option.yAxis).toMatchObject({ interval: 5000 });
  });

  it('wraps long x-axis and y-axis names before passing them to ECharts', () => {
    const longXAxisName = 'A very long dimension label that needs wrapping';
    const longYAxisName = 'A very long unit label that needs wrapping';
    vi.mocked(mapPxTableToChartDataset).mockReturnValueOnce({
      ...mockDataset,
      unit: longYAxisName,
    });
    const pxtable = { stub: [{ label: longXAxisName }] } as PxTable;

    renderChart({ pxtable });

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    expect(option.xAxis).toMatchObject({
      name: expect.stringContaining('\n'),
    });
    expect(option.yAxis).toMatchObject({
      name: expect.stringContaining('\n'),
    });
  });

  it('disables series emphasis on medium and smaller screens', () => {
    renderChart({ screenSize: 'medium' });

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    expect(option.series).toEqual([
      expect.objectContaining({ emphasis: { disabled: true } }),
      expect.objectContaining({ emphasis: { disabled: true } }),
      expect.objectContaining({ emphasis: { disabled: true } }),
    ]);
  });

  it('uses fallback colors when colors are not provided', () => {
    const fallbackColors = ['#abcdef', '#fedcba'];
    vi.mocked(getChartCssVariables).mockReturnValue({
      chartColors: fallbackColors,
      axisColor: undefined,
      fontColor: undefined,
    });

    renderChart();

    expect(getChartCssVariables).toHaveBeenCalledTimes(1);
    expect(buildSeriesOption).toHaveBeenCalledWith(
      mockDataset,
      'bar',
      fallbackColors,
    );
  });

  it('uses fallback colors when the provided colors array is empty', () => {
    const fallbackColors = ['#121212', '#343434'];
    vi.mocked(getChartCssVariables).mockReturnValue({
      chartColors: fallbackColors,
      axisColor: undefined,
      fontColor: undefined,
    });

    renderChart({ colors: [] });

    expect(getChartCssVariables).toHaveBeenCalledTimes(1);
    expect(buildSeriesOption).toHaveBeenCalledWith(
      mockDataset,
      'bar',
      fallbackColors,
    );
  });

  it('reserves space for the x-axis and legend below the plot', () => {
    const { container } = renderChart();
    const chartDiv = Array.from(container.querySelectorAll('div')).find(
      (element) => element.style.height,
    );

    expect(chartDiv).toBeTruthy();
    const labelHeight = createResponsiveXAxisLabelConfig(16).estimateHeight([
      '2024',
    ]);
    expect(chartDiv?.style.height).toBe(
      `${(528 + labelHeight + 16 + 120) / 16}rem`,
    );
  });

  it('allows vertical page scrolling but prevents horizontal page movement', () => {
    const { container } = renderChart();
    const chartDiv = Array.from(container.querySelectorAll('div')).find(
      (element) => element.style.height,
    );

    expect(chartDiv?.style.touchAction).toBe('pan-y');
  });

  it('returns empty tooltip text for empty params', () => {
    renderChart();

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);
    expect(formatter).toBeTypeOf('function');
    expect(formatter?.([])).toBe('');
  });

  it('formats tooltip text only for the hovered series', () => {
    const chart = { on: vi.fn(), off: vi.fn() };
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: { current: chart as unknown as echarts.EChartsType },
      estimatedLegendHeight: null,
    });

    renderChart();

    const mouseOverHandler = chart.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseover',
    )?.[1] as (params: { componentType: string; seriesIndex: number }) => void;
    mouseOverHandler({ componentType: 'series', seriesIndex: 1 });

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);
    const html = formatter?.([
      {
        axisValueLabel: '2024',
        dataIndex: 0,
        seriesIndex: 0,
        seriesName: 'Men',
        data: { men: 10, women: 12 },
      },
      {
        axisValueLabel: '2024',
        dataIndex: 0,
        seriesIndex: 1,
        seriesName: 'Women',
        color: '#ff0000',
        data: { men: 10, women: 12 },
      },
    ]);

    expect(html).toContain('2024');
    expect(html).toContain('Women: <strong>12</strong>');
    expect(html).not.toContain('Men: <strong>10</strong>');
    expect(html).toContain('<marker fill="#ff0000" />');
  });

  it('uses formatted values in the tooltip', () => {
    const chart = { on: vi.fn(), off: vi.fn() };
    vi.mocked(mapPxTableToChartDataset).mockReturnValue({
      ...mockDataset,
      formattedValues: [{ men: '10', women: '12.35' }],
    });
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: { current: chart as unknown as echarts.EChartsType },
      estimatedLegendHeight: null,
    });

    renderChart();

    const mouseOverHandler = chart.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseover',
    )?.[1] as (params: { componentType: string; seriesIndex: number }) => void;
    mouseOverHandler({ componentType: 'series', seriesIndex: 1 });

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);
    const html = formatter?.([
      {
        axisValueLabel: '2024',
        dataIndex: 0,
        seriesIndex: 1,
        seriesName: 'Women',
        data: { men: 10, women: 12.345 },
      },
    ]);

    expect(html).toContain('Women: <strong>12.35</strong>');
    expect(html).not.toContain('<strong>12.35 persons</strong>');
    expect(html).not.toContain('Women: 12.345');
  });

  describe('legends', () => {
    it('shows a "Show more" button on small screens with more than 5 series', () => {
      vi.mocked(mapPxTableToChartDataset).mockReturnValue({
        ...mockDataset,
        series: ['a', 'b', 'c', 'd', 'e', 'f'].map((key) => ({
          key,
          name: key.toUpperCase(),
        })),
      });

      renderChart({ screenSize: 'small' });

      expect(
        screen.getByRole('button', { name: /Show More/i }),
      ).toBeInTheDocument();
    });

    it('does not show a "Show more" button on large screens', () => {
      vi.mocked(mapPxTableToChartDataset).mockReturnValue({
        ...mockDataset,
        series: ['a', 'b', 'c', 'd', 'e', 'f'].map((key) => ({
          key,
          name: key.toUpperCase(),
        })),
      });

      renderChart({ screenSize: 'large' });

      expect(
        screen.queryByRole('button', { name: /Show More/i }),
      ).not.toBeInTheDocument();
    });

    it('does not show a "Show more" button on small screens with 5 or fewer series', () => {
      renderChart({ screenSize: 'small' });

      expect(
        screen.queryByRole('button', { name: /Show More/i }),
      ).not.toBeInTheDocument();
    });

    it('toggles the legend expansion state', () => {
      vi.mocked(mapPxTableToChartDataset).mockReturnValue({
        ...mockDataset,
        series: ['a', 'b', 'c', 'd', 'e', 'f'].map((key) => ({
          key,
          name: key.toUpperCase(),
        })),
      });

      renderChart({ screenSize: 'small' });
      const showMoreButton = screen.getByRole('button', {
        name: /Show More/i,
      });

      fireEvent.click(showMoreButton);
      expect(
        screen.getByRole('button', { name: /Show Less/i }),
      ).toBeInTheDocument();

      fireEvent.click(showMoreButton);
      expect(
        screen.getByRole('button', { name: /Show More/i }),
      ).toBeInTheDocument();
    });
  });

  describe('LegendToggleButton', () => {
    it('renders the collapsed label and icon', () => {
      const { container } = render(
        <LegendToggleButton
          onClick={vi.fn()}
          text="Show More"
          isExpanded={false}
        />,
      );

      expect(
        screen.getByRole('button', { name: /Show More/i }),
      ).toBeInTheDocument();
      expect(container.querySelector('button svg path')).toHaveAttribute(
        'd',
        Icons.ChevronDown.props.d,
      );
    });

    it('renders the expanded label and icon', () => {
      const { container } = render(
        <LegendToggleButton
          onClick={vi.fn()}
          text="Show Less"
          isExpanded={true}
        />,
      );

      expect(
        screen.getByRole('button', { name: /Show Less/i }),
      ).toBeInTheDocument();
      expect(container.querySelector('button svg path')).toHaveAttribute(
        'd',
        Icons.ChevronUp.props.d,
      );
    });
  });

  it('renders empty state when multiple units are selected', () => {
    vi.mocked(checkMultipleUnits).mockReturnValue(true);

    renderChart();

    expect(screen.getByText('Cannot display chart')).toBeInTheDocument();
  });
});
