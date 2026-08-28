import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import type * as echarts from 'echarts';

import { LineChart } from './LineChart';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import { useEChartOption } from '../Utils/useEChartOption';
import {
  buildDatasetOption,
  buildSeriesOption,
} from '../Utils/chartOptionBuilder';
import {
  getChartColorsFromCssVariables,
  checkMultipleUnits,
} from '../Utils/chartHelper';
import type { EChartsDataset } from '../Utils/chartTypes';
import type { PxTable } from '../../../shared-types/pxTable';

vi.mock('../Utils/chartDataMapper', () => ({
  mapPxTableToChartDataset: vi.fn(),
}));

vi.mock('../Utils/useEChartOption', () => ({
  useEChartOption: vi.fn(),
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
  getChartColorsFromCssVariables: vi.fn(),
  getAdaptiveYAxisMin: vi.fn(),
  getAdaptiveYAxisMax: vi.fn(),
  checkMultipleUnits: vi.fn(),
}));

const mockDataset: EChartsDataset = {
  title: 'Population by year',
  origin: 'Statistics Demo',
  unit: 'persons',
  dimensions: ['name', 'men', 'women'],
  source: [{ name: '2024', men: 10, women: 12 }],
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
    'The line chart cannot be displayed because your selection includes contents with different units (for example number and percent). Please select contents with the same unit to see the line chart.',
};

const mockPxTable = {
  stub: [{ label: 'Year' }],
} as PxTable;

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

describe('LineChart', () => {
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
      { name: 'Men', type: 'line', symbol: 'circle', symbolSize: 8 },
      { name: 'Women', type: 'line', symbol: 'rect', symbolSize: 8 },
      { name: 'Total', type: 'line', symbol: 'triangle', symbolSize: 8 },
    ]);
    vi.mocked(getChartColorsFromCssVariables).mockReturnValue([
      '#333333',
      '#444444',
    ]);
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: { current: null },
    });
  });

  it('builds chart option with mapped dataset and provided colors', () => {
    const colors = ['#111111', '#222222'];

    render(
      <LineChart
        pxtable={mockPxTable}
        colors={colors}
        translations={mockTranslations}
      />,
    );

    expect(mapPxTableToChartDataset).toHaveBeenCalledWith(mockPxTable);
    expect(buildDatasetOption).toHaveBeenCalledWith(mockDataset);
    expect(buildSeriesOption).toHaveBeenCalledWith(mockDataset, 'line', colors);
    expect(getChartColorsFromCssVariables).not.toHaveBeenCalled();

    const option = vi.mocked(useEChartOption).mock.calls[0][0];

    expect(option.legend).toEqual({
      data: ['Men', 'Women', 'Total'],
      height: 40 * mockDataset.series.length,
    });
    expect(option.yAxis).toMatchObject({
      name: 'persons',
    });
    expect(option.grid).toEqual({
      top: 0,
      bottom: 200,
      left: '0',
      right: '0',
      containLabel: false,
    });
    expect(option.tooltip).toMatchObject({
      trigger: 'axis',
      extraCssText:
        'max-width:400px;box-sizing:border-box;white-space:normal;overflow-wrap:anywhere;',
    });
  });

  it('uses fallback colors when colors are not provided', () => {
    const fallbackColors = ['#abcdef', '#fedcba'];
    vi.mocked(getChartColorsFromCssVariables).mockReturnValue(fallbackColors);

    render(<LineChart pxtable={mockPxTable} translations={mockTranslations} />);

    expect(getChartColorsFromCssVariables).toHaveBeenCalledTimes(1);
    expect(buildSeriesOption).toHaveBeenCalledWith(
      mockDataset,
      'line',
      fallbackColors,
    );
  });

  it('uses fallback colors when provided colors array is empty', () => {
    const fallbackColors = ['#121212', '#343434'];
    vi.mocked(getChartColorsFromCssVariables).mockReturnValue(fallbackColors);

    render(
      <LineChart
        pxtable={mockPxTable}
        colors={[]}
        translations={mockTranslations}
      />,
    );

    expect(getChartColorsFromCssVariables).toHaveBeenCalledTimes(1);
    expect(buildSeriesOption).toHaveBeenCalledWith(
      mockDataset,
      'line',
      fallbackColors,
    );
  });

  it('renders chart container with height based on number of series', () => {
    const { container } = render(
      <LineChart pxtable={mockPxTable} translations={mockTranslations} />,
    );

    const chartDiv = Array.from(container.querySelectorAll('div')).find(
      (element) => element.style.height,
    );

    expect(chartDiv).toBeTruthy();
    expect(chartDiv?.style.height).toBe('630px');
  });

  it('allows vertical page scrolling but prevents horizontal page movement', () => {
    const { container } = render(
      <LineChart pxtable={mockPxTable} translations={mockTranslations} />,
    );

    const chartDiv = Array.from(container.querySelectorAll('div')).find(
      (element) => element.style.height,
    );

    expect(chartDiv?.style.touchAction).toBe('pan-y');
  });

  it('returns empty tooltip text for empty params', () => {
    render(<LineChart pxtable={mockPxTable} translations={mockTranslations} />);

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);

    expect(formatter).toBeTypeOf('function');
    expect(formatter?.([])).toBe('');
  });

  it('returns empty tooltip text when no series is hovered', () => {
    render(<LineChart pxtable={mockPxTable} translations={mockTranslations} />);

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);

    expect(
      formatter?.([
        {
          axisValueLabel: '2024',
          seriesIndex: 0,
          seriesName: 'Men',
          data: { men: 10, women: 12 },
        },
      ]),
    ).toBe('');
  });

  it('formats tooltip text only for the hovered series', () => {
    const chart = {
      on: vi.fn(),
      off: vi.fn(),
    };
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: { current: chart as unknown as echarts.EChartsType },
    });

    render(<LineChart pxtable={mockPxTable} translations={mockTranslations} />);

    const mouseOverHandler = chart.on.mock.calls.find(
      ([eventName]) => eventName === 'mouseover',
    )?.[1] as (params: { componentType: string; seriesIndex: number }) => void;
    mouseOverHandler({ componentType: 'series', seriesIndex: 1 });

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);

    const html = formatter?.([
      {
        axisValueLabel: '2024',
        seriesIndex: 0,
        seriesName: 'Men',
        data: { men: 10, women: 12 },
      },
      {
        axisValueLabel: '2024',
        seriesIndex: 1,
        seriesName: 'Women',
        color: '#ff0000',
        data: { men: 10, women: 12 },
      },
    ]);

    expect(html).toContain('<div><div>2024</div>');
    expect(html).toContain('Women: 12');
    expect(html).not.toContain('Men: 10');
    expect(html).toContain('fill="#ff0000"');
    expect(html).toContain('<rect');
  });

  describe('legends', () => {
    it('shows a "Show more" button on small screens, when there are more than 5 series', () => {
      vi.mocked(mapPxTableToChartDataset).mockReturnValue({
        ...mockDataset,
        series: [
          { key: 'a', name: 'A' },
          { key: 'b', name: 'B' },
          { key: 'c', name: 'C' },
          { key: 'd', name: 'D' },
          { key: 'e', name: 'E' },
          { key: 'f', name: 'F' },
        ],
      });

      render(
        <LineChart
          pxtable={mockPxTable}
          isMediumOrSmallerScreen={true}
          translations={mockTranslations}
        />,
      );

      expect(
        screen.getByRole('button', { name: /Show More/i }),
      ).toBeInTheDocument();
    });

    it('does not show a "Show more" button on large screens, even with more than 5 series', () => {
      vi.mocked(mapPxTableToChartDataset).mockReturnValue({
        ...mockDataset,
        series: [
          { key: 'a', name: 'A' },
          { key: 'b', name: 'B' },
          { key: 'c', name: 'C' },
          { key: 'd', name: 'D' },
          { key: 'e', name: 'E' },
          { key: 'f', name: 'F' },
        ],
      });

      render(
        <LineChart
          pxtable={mockPxTable}
          isMediumOrSmallerScreen={false}
          translations={mockTranslations}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /Show More/i }),
      ).not.toBeInTheDocument();
    });

    it('does not show a "Show more" button on small screens with 5 or fewer series', () => {
      render(
        <LineChart
          pxtable={mockPxTable}
          isMediumOrSmallerScreen={true}
          translations={mockTranslations}
        />,
      );

      expect(
        screen.queryByRole('button', {
          name: /Show More/i,
        }),
      ).not.toBeInTheDocument();
    });

    it('toggles the legend expansion state when the "Show more" button is clicked', () => {
      vi.mocked(mapPxTableToChartDataset).mockReturnValue({
        ...mockDataset,
        series: [
          { key: 'a', name: 'A' },
          { key: 'b', name: 'B' },
          { key: 'c', name: 'C' },
          { key: 'd', name: 'D' },
          { key: 'e', name: 'E' },
          { key: 'f', name: 'F' },
        ],
      });

      render(
        <LineChart
          pxtable={mockPxTable}
          isMediumOrSmallerScreen={true}
          translations={mockTranslations}
        />,
      );

      const showMoreButton = screen.getByRole('button', {
        name: /Show More/i,
      });

      expect(showMoreButton).toBeInTheDocument();

      // Click the button to expand the legend
      fireEvent.click(showMoreButton);

      // After clicking, the button text should change to "Show less"
      expect(
        screen.getByRole('button', { name: /Show Less/i }),
      ).toBeInTheDocument();

      // Click the button again to collapse the legend
      fireEvent.click(showMoreButton);

      // After clicking again, the button text should revert to "Show more"
      expect(
        screen.getByRole('button', { name: /Show More/i }),
      ).toBeInTheDocument();
    });
  });
});

it('renders empty state when multiple units are selected', () => {
  vi.mocked(checkMultipleUnits).mockReturnValue(true);
  const { getByText } = render(
    <LineChart pxtable={mockPxTable} translations={mockTranslations} />,
  );
  expect(getByText('Cannot display chart')).toBeTruthy();
});
