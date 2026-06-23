import { render } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';

import LineChart from './LineChart';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import { useEChartOption } from '../Utils/useEChartOption';
import {
  buildDatasetOption,
  buildSeriesOption,
} from '../Utils/chartOptionBuilder';
import { getChartColorsFromCssVariables } from '../Utils/chartHelper';
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

    render(<LineChart pxtable={{} as PxTable} colors={colors} />);

    expect(mapPxTableToChartDataset).toHaveBeenCalledWith({});
    expect(buildDatasetOption).toHaveBeenCalledWith(mockDataset);
    expect(buildSeriesOption).toHaveBeenCalledWith(mockDataset, 'line', colors);
    expect(getChartColorsFromCssVariables).not.toHaveBeenCalled();

    const option = vi.mocked(useEChartOption).mock.calls[0][0];

    expect(option.legend).toEqual({
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
  });

  it('uses fallback colors when colors are not provided', () => {
    const fallbackColors = ['#abcdef', '#fedcba'];
    vi.mocked(getChartColorsFromCssVariables).mockReturnValue(fallbackColors);

    render(<LineChart pxtable={{} as PxTable} />);

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

    render(<LineChart pxtable={{} as PxTable} colors={[]} />);

    expect(getChartColorsFromCssVariables).toHaveBeenCalledTimes(1);
    expect(buildSeriesOption).toHaveBeenCalledWith(
      mockDataset,
      'line',
      fallbackColors,
    );
  });

  it('renders chart container with height based on number of series', () => {
    const { container } = render(<LineChart pxtable={{} as PxTable} />);

    const chartDiv = Array.from(container.querySelectorAll('div')).find(
      (element) => element.style.height,
    );

    expect(chartDiv).toBeTruthy();
    expect(chartDiv?.style.height).toBe('630px');
  });

  it('returns empty tooltip text for empty params', () => {
    render(<LineChart pxtable={{} as PxTable} />);

    const option = vi.mocked(useEChartOption).mock.calls[0][0];
    const formatter = getTooltipFormatter(option);

    expect(formatter).toBeTypeOf('function');
    expect(formatter?.([])).toBe('');
  });

  it('formats tooltip rows with symbol svg, labels, values and fallback color', () => {
    render(<LineChart pxtable={{} as PxTable} />);

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
    expect(html).toContain('Men: 10');
    expect(html).toContain('Women: 12');
    expect(html).toContain('fill="#666666"');
    expect(html).toContain('fill="#ff0000"');
    expect(html).toContain('<circle');
    expect(html).toContain('<rect');
  });
});
