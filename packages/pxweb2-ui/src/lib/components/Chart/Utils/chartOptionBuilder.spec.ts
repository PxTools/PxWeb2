import { describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts/index.js';
import env from 'zrender/lib/core/env.js';

import { buildDatasetOption, buildSeriesOption } from './chartOptionBuilder';
import type { EChartsDataset } from './chartTypes';

const mockDataset: EChartsDataset = {
  title: 'Population by year',
  origin: 'Statistics Demo',
  unit: 'persons',
  dimensions: ['name', 'men', 'women'],
  source: [
    { name: '2022', men: 100, women: 110 },
    { name: '2023', men: 120, women: 130 },
  ],
  formattedValues: [
    { men: '100', women: '110' },
    { men: '120', women: '130' },
  ],
  series: [
    { key: 'men', name: 'Men' },
    { key: 'women', name: 'Women' },
  ],
};

describe('buildDatasetOption', () => {
  it('builds chart option with dataset, legend and tooltip', () => {
    const option = buildDatasetOption(mockDataset);

    expect(option).toEqual({
      dataset: {
        dimensions: ['name', 'men', 'women'],
        source: [
          { name: '2022', men: 100, women: 110 },
          { name: '2023', men: 120, women: 130 },
        ],
      },
      legend: {},
      tooltip: {},
    });
  });
});

describe('buildSeriesOption', () => {
  it('builds line series with names from dataset', () => {
    const series = buildSeriesOption(mockDataset, 'line');

    expect(series).toEqual([
      {
        name: 'Men',
        type: 'line',
        color: undefined,
        symbol: 'circle',
        symbolSize: expect.any(Function),
        showAllSymbol: true,
        triggerEvent: 'line',
        emphasis: { scale: 1.5 },
      },
      {
        name: 'Women',
        type: 'line',
        color: undefined,
        symbol: 'rect',
        symbolSize: expect.any(Function),
        showAllSymbol: true,
        triggerEvent: 'line',
        emphasis: { scale: 1.5 },
      },
    ]);
  });

  it('only shows a marker at each series last valid point', () => {
    const dataset: EChartsDataset = {
      ...mockDataset,
      source: [
        { name: '2021', men: 0, women: 100 },
        { name: '2022', men: 120, women: null },
        { name: '2023', men: null, women: 130 },
        { name: '2024', men: null, women: null },
      ],
    };
    const series = buildSeriesOption(dataset, 'line');
    const sizes = series.map((line) => {
      if (line.type !== 'line' || typeof line.symbolSize !== 'function') {
        throw new Error('Expected a line series with a symbol size callback');
      }
      const size = line.symbolSize;
      return dataset.source.map((_, dataIndex) =>
        size(0, { dataIndex } as Parameters<typeof size>[1]),
      );
    });

    expect(sizes).toEqual([
      [0, 8, 0, 0],
      [0, 0, 8, 0],
    ]);
    expect(buildDatasetOption(dataset).dataset).toMatchObject({
      source: dataset.source,
    });
  });

  it('shows no markers when a series has no valid values', () => {
    const dataset: EChartsDataset = {
      ...mockDataset,
      source: [{ name: '2023', men: null, women: null }],
    };
    const [series] = buildSeriesOption(dataset, 'line');
    if (series.type !== 'line' || typeof series.symbolSize !== 'function') {
      throw new Error('Expected a line series with a symbol size callback');
    }

    expect(
      series.symbolSize(0, {
        dataIndex: 0,
      } as Parameters<typeof series.symbolSize>[1]),
    ).toBe(0);
  });

  it('shows tooltips on unmarked points when hovering either line', () => {
    // ECharts disables tooltips for jsdom's default Node.js user agent.
    const wasNode = env.node;
    env.node = false;
    const canvasContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    const container = document.createElement('div');
    const chart = echarts.init(container, undefined, {
      renderer: 'svg',
      width: 800,
      height: 400,
    });

    try {
      const dataset: EChartsDataset = {
        ...mockDataset,
        source: Array.from({ length: 101 }, (_, index) => ({
          name: `${index}`,
          men: 20,
          women: 80,
        })),
      };
      let selectedSeries: number | undefined;
      let tooltipText = '';
      chart.setOption({
        ...buildDatasetOption(dataset),
        animation: false,
        xAxis: { type: 'category', axisLabel: { show: false } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { show: false } },
        series: buildSeriesOption(dataset, 'line'),
        tooltip: {
          trigger: 'axis',
          formatter: (
            params:
              | {
                  seriesIndex?: number;
                  seriesName?: string;
                  dataIndex?: number;
                }
              | {
                  seriesIndex?: number;
                  seriesName?: string;
                  dataIndex?: number;
                }[],
          ) => {
            const items = Array.isArray(params) ? params : [params];
            const item = items.find(
              (value) => value.seriesIndex === selectedSeries,
            );
            tooltipText = item ? `${item.seriesName}:${item.dataIndex}` : '';
            return tooltipText;
          },
        },
      });
      chart.on('mousemove', (params) => {
        if (
          params.componentType === 'series' &&
          selectedSeries !== params.seriesIndex &&
          params.event
        ) {
          selectedSeries = params.seriesIndex;
          chart.dispatchAction({ type: 'hideTip' });
          chart.dispatchAction({
            type: 'showTip',
            x: params.event.offsetX,
            y: params.event.offsetY,
          });
        }
      });
      chart.getZr().refreshImmediately();

      const moveTo = (seriesIndex: number, value: number) => {
        const [zrX, zrY] = chart.convertToPixel({ seriesIndex }, [5, value]);
        chart.getZr().handler.mousemove(
          Object.assign(new MouseEvent('mousemove'), {
            zrX,
            zrY,
            zrDelta: 0,
            zrEventControl: 'no_globalout' as const,
            zrByTouch: false,
          }),
        );
      };

      moveTo(0, 20);
      expect(tooltipText).toBe('Men:5');
      moveTo(1, 80);
      expect(tooltipText).toBe('Women:5');
      chart.getZr().refreshImmediately();
      expect(container.querySelector('svg')?.outerHTML).not.toContain('NaN');
    } finally {
      chart.dispose();
      canvasContext.mockRestore();
      env.node = wasNode;
    }
  });

  it('builds bar series with provided colors', () => {
    const series = buildSeriesOption(mockDataset, 'bar', [
      '#111111',
      '#222222',
    ]);

    expect(series).toEqual([
      {
        name: 'Men',
        type: 'bar',
        color: '#111111',
        barMaxWidth: 100,
      },
      {
        name: 'Women',
        type: 'bar',
        color: '#222222',
        barMaxWidth: 100,
      },
    ]);
  });

  it('cycles colors when there are fewer colors than series', () => {
    const datasetWithThreeSeries: EChartsDataset = {
      ...mockDataset,
      dimensions: ['name', 'men', 'women', 'total'],
      series: [
        { key: 'men', name: 'Men' },
        { key: 'women', name: 'Women' },
        { key: 'total', name: 'Total' },
      ],
      source: [{ name: '2022', men: 100, women: 110, total: 210 }],
      formattedValues: [{ men: '100', women: '110', total: '210' }],
    };

    const series = buildSeriesOption(datasetWithThreeSeries, 'bar', [
      '#aaaaaa',
    ]);

    expect(series).toEqual([
      {
        name: 'Men',
        type: 'bar',
        color: '#aaaaaa',
        barMaxWidth: 100,
      },
      {
        name: 'Women',
        type: 'bar',
        color: '#aaaaaa',
        barMaxWidth: 100,
      },
      {
        name: 'Total',
        type: 'bar',
        color: '#aaaaaa',
        barMaxWidth: 100,
      },
    ]);
  });
});
