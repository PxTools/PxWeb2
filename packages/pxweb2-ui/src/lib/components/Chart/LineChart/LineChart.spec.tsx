import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import * as echarts from 'echarts';

import { LineChart, LineChartHandle } from './LineChart';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import { useEChartOption } from '../Utils/useEChartOption';
import {
  buildDatasetOption,
  buildSeriesOption,
} from '../Utils/chartOptionBuilder';
import { getChartColorsFromCssVariables } from '../Utils/chartHelper';
import type { EChartsDataset } from '../Utils/chartTypes';
import type { PxTable } from '../../../shared-types/pxTable';
import styles from './LineChart.module.scss';

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

vi.mock('echarts', async () => {
  const actual = await vi.importActual<typeof import('echarts')>('echarts');
  return {
    ...actual,
    init: vi.fn(actual.init),
  };
});

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

function getLastChartOption() {
  const calls = vi.mocked(useEChartOption).mock.calls;
  const lastCall = calls.at(-1);

  if (!lastCall) {
    throw new Error('Expected useEChartOption to be called');
  }

  return lastCall[0];
}

const overflowingDataset: EChartsDataset = {
  ...mockDataset,
  dimensions: ['name', 's1', 's2', 's3', 's4', 's5'],
  source: [{ name: '2024', s1: 10, s2: 12, s3: 14, s4: 16, s5: 18 }],
  series: [
    { key: 's1', name: 'Detailed population segment 1' },
    { key: 's2', name: 'Detailed population segment 2' },
    { key: 's3', name: 'Detailed population segment 3' },
    { key: 's4', name: 'Detailed population segment 4' },
    { key: 's5', name: 'Detailed population segment 5' },
  ],
};

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
      height: 72,
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

  it('renders chart container with stylesheet sizing', () => {
    const { container } = render(<LineChart pxtable={{} as PxTable} />);

    const chartDiv = container.querySelector(`.${styles.chart}`);

    expect(chartDiv).toBeTruthy();
    expect(chartDiv?.getAttribute('style')).toBeNull();
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

  it('uses ECharts paginated legend without changing chart data', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValue(overflowingDataset);

    render(
      <LineChart
        pxtable={{} as PxTable}
        legendOverflowMode="pagination"
        visibleLegendItemCount={2}
      />,
    );

    expect(buildDatasetOption).toHaveBeenLastCalledWith(overflowingDataset);
    expect(buildSeriesOption).toHaveBeenLastCalledWith(
      overflowingDataset,
      'line',
      ['#333333', '#444444'],
    );
    expect(getLastChartOption().legend).toEqual({
      height: 48,
      type: 'scroll',
      orient: 'vertical',
      data: overflowingDataset.series.map((series) => series.name),
      pageButtonPosition: 'end',
      pageFormatter: '{current} / {total}',
    });
    expect(getLastChartOption().dataZoom).toBeUndefined();
  });

  it('supports a horizontal ECharts paginated legend', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValue(overflowingDataset);

    render(
      <LineChart
        pxtable={{} as PxTable}
        legendOverflowMode="pagination"
        legendPaginationOrientation="horizontal"
        visibleLegendItemCount={2}
      />,
    );

    expect(getLastChartOption().legend).toEqual({
      height: 48,
      type: 'scroll',
      orient: 'horizontal',
      data: overflowingDataset.series.map((series) => series.name),
      pageButtonPosition: 'end',
      pageFormatter: '{current} / {total}',
    });
  });

  it('reveals all legend items when show more mode is expanded', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValue(overflowingDataset);

    render(
      <LineChart
        pxtable={{} as PxTable}
        legendOverflowMode="showMore"
        visibleLegendItemCount={2}
      />,
    );

    expect(buildDatasetOption).toHaveBeenLastCalledWith(overflowingDataset);
    expect(getLastChartOption().legend).toEqual({
      height: 48,
      data: ['Detailed population segment 1', 'Detailed population segment 2'],
    });

    fireEvent.click(screen.getByRole('button', { name: 'Show more' }));

    expect(buildDatasetOption).toHaveBeenLastCalledWith(overflowingDataset);
    expect(getLastChartOption().legend).toEqual({
      height: 120,
      data: overflowingDataset.series.map((series) => series.name),
    });
    expect(screen.getByRole('button', { name: 'Show less' })).toBeTruthy();
  });

  it('exposes getSvgDataURL that renders the option offscreen with an svg renderer', () => {
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: {
        current: {
          getDataURL: vi.fn(),
          getWidth: () => 640,
          getHeight: () => 480,
        } as never,
      },
    });

    const svgExportGetDataURL = vi
      .fn()
      .mockReturnValue('data:image/svg+xml;base64,abc');
    const dispose = vi.fn();
    const setOption = vi.fn();
    const initSpy = vi.mocked(echarts.init).mockReturnValue({
      setOption,
      getDataURL: svgExportGetDataURL,
      dispose,
    } as never);

    const ref = createRef<LineChartHandle>();
    render(<LineChart pxtable={{} as PxTable} ref={ref} />);

    expect(ref.current?.getSvgDataURL()).toBe('data:image/svg+xml;base64,abc');
    expect(initSpy).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      null,
      expect.objectContaining({ renderer: 'svg', width: 640, height: 480 }),
    );
    expect(svgExportGetDataURL).toHaveBeenCalledWith({ type: 'svg' });
    expect(setOption).toHaveBeenCalledWith(
      expect.objectContaining({ animation: false }),
    );
    expect(dispose).toHaveBeenCalledTimes(1);

    initSpy.mockRestore();
  });

  it('exposes getPngDataURL that renders the option offscreen with a canvas renderer', () => {
    const svgChartGetDataURL = vi.fn();
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: {
        current: {
          getDataURL: svgChartGetDataURL,
          getWidth: () => 640,
          getHeight: () => 480,
        } as never,
      },
    });

    const pngChartGetDataURL = vi
      .fn()
      .mockReturnValue('data:image/png;base64,abc');
    const dispose = vi.fn();
    const setOption = vi.fn();
    const initSpy = vi.mocked(echarts.init).mockReturnValue({
      setOption,
      getDataURL: pngChartGetDataURL,
      dispose,
    } as never);

    const ref = createRef<LineChartHandle>();
    render(<LineChart pxtable={{} as PxTable} ref={ref} />);

    expect(ref.current?.getPngDataURL()).toBe('data:image/png;base64,abc');
    expect(initSpy).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      null,
      expect.objectContaining({ renderer: 'canvas', width: 640, height: 480 }),
    );
    expect(pngChartGetDataURL).toHaveBeenCalledWith({ type: 'png' });
    expect(setOption).toHaveBeenCalledWith(
      expect.objectContaining({ animation: false }),
    );
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(svgChartGetDataURL).not.toHaveBeenCalled();

    initSpy.mockRestore();
  });

  it('always exports the full legend and extra height, even when "show more" truncates it on screen', () => {
    vi.mocked(mapPxTableToChartDataset).mockReturnValue(overflowingDataset);
    vi.mocked(useEChartOption).mockReturnValue({
      divRef: { current: null },
      chartRef: {
        current: {
          getDataURL: vi.fn(),
          getWidth: () => 640,
          getHeight: () => 480,
        } as never,
      },
    });

    const setOption = vi.fn();
    const initSpy = vi.mocked(echarts.init).mockReturnValue({
      setOption,
      getDataURL: vi.fn().mockReturnValue('data:image/png;base64,abc'),
      dispose: vi.fn(),
    } as never);

    const ref = createRef<LineChartHandle>();
    render(
      <LineChart
        pxtable={{} as PxTable}
        legendOverflowMode="showMore"
        visibleLegendItemCount={2}
        ref={ref}
      />,
    );

    // On screen, only 2 of the 5 legend items are shown until "Show more" is clicked
    expect(getLastChartOption().legend).toEqual({
      height: 48,
      data: overflowingDataset.series.slice(0, 2).map((series) => series.name),
    });

    ref.current?.getPngDataURL();

    // Exported legend always contains every series, with no truncated `data` list
    expect(setOption).toHaveBeenCalledWith(
      expect.objectContaining({ legend: { height: 120 } }),
    );
    // Chart height grows to fit the full legend instead of the collapsed on-screen height
    expect(initSpy).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      null,
      expect.objectContaining({ height: 480 + (120 - 48) }),
    );

    initSpy.mockRestore();
  });

  it('returns undefined from getSvgDataURL when the chart instance is not ready', () => {
    const ref = createRef<LineChartHandle>();

    render(<LineChart pxtable={{} as PxTable} ref={ref} />);

    expect(ref.current?.getSvgDataURL()).toBeUndefined();
  });

  it('returns undefined from getPngDataURL when the chart instance is not ready', () => {
    const ref = createRef<LineChartHandle>();

    render(<LineChart pxtable={{} as PxTable} ref={ref} />);

    expect(ref.current?.getPngDataURL()).toBeUndefined();
  });
});
