import { describe, expect, it } from 'vitest';

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
  series: [
    { key: 'men', name: 'Men' },
    { key: 'women', name: 'Women' },
  ],
};

describe('buildDatasetOption', () => {
  it('builds chart option with title, source graphic, dataset, legend and tooltip', () => {
    const option = buildDatasetOption(mockDataset);

    expect(option).toEqual({
      title: {
        text: 'Population by year',
        left: 0,
        right: 0,
        width: '100%',
        textStyle: {
          overflow: 'break',
          align: 'center',
          lineHeight: 20,
        },
      },
      graphic: [
        {
          type: 'text',
          left: 8,
          bottom: 8,
          silent: true,
          style: {
            text: 'Source: Statistics Demo',
            fill: '#6b7280',
            font: '12px sans-serif',
          },
        },
      ],
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
      { name: 'Men', type: 'line', color: undefined },
      { name: 'Women', type: 'line', color: undefined },
    ]);
  });

  it('builds bar series with provided colors', () => {
    const series = buildSeriesOption(mockDataset, 'bar', [
      '#111111',
      '#222222',
    ]);

    expect(series).toEqual([
      { name: 'Men', type: 'bar', color: '#111111' },
      { name: 'Women', type: 'bar', color: '#222222' },
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
    };

    const series = buildSeriesOption(datasetWithThreeSeries, 'bar', [
      '#aaaaaa',
    ]);

    expect(series).toEqual([
      { name: 'Men', type: 'bar', color: '#aaaaaa' },
      { name: 'Women', type: 'bar', color: '#aaaaaa' },
      { name: 'Total', type: 'bar', color: '#aaaaaa' },
    ]);
  });
});
