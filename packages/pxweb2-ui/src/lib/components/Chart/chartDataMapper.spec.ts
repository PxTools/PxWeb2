import { describe, expect, it } from 'vitest';

import { mapChartConfigToEChartsDataset } from './chartDataMapper';

import type { ChartConfig } from './chartTypes';

describe('mapChartConfigToEChartsDataset', () => {
  it('maps dimensions and values using chart series order', () => {
    const chartConfig: ChartConfig = {
      series: [
        { key: 'year-2024', name: '2024' },
        { key: 'year-2025', name: '2025' },
      ],
      data: [
        { name: 'Product A', 'year-2024': 10, 'year-2025': 20 },
        { name: 'Product B', 'year-2024': 30, 'year-2025': 40 },
      ],
    };

    const dataset = mapChartConfigToEChartsDataset(chartConfig);

    expect(dataset.dimensions).toEqual(['name', 'year-2024', 'year-2025']);
    expect(dataset.series).toEqual(chartConfig.series);
    expect(dataset.source).toEqual([
      { name: 'Product A', 'year-2024': 10, 'year-2025': 20 },
      { name: 'Product B', 'year-2024': 30, 'year-2025': 40 },
    ]);
  });

  it('preserves null values and normalizes missing/non-numeric series values to null', () => {
    const chartConfig: ChartConfig = {
      series: [
        { key: 'first', name: 'First' },
        { key: 'second', name: 'Second' },
      ],
      data: [{ name: 'Category 1', first: null }],
    };

    const dataset = mapChartConfigToEChartsDataset(chartConfig);

    expect(dataset.source).toEqual([
      { name: 'Category 1', first: null, second: null },
    ]);
  });
});
