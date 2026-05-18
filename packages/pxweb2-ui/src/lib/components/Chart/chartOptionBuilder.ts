import type * as echarts from 'echarts';

import type { EChartsDataset } from './chartTypes';

export function buildDatasetOption(
  dataset: EChartsDataset,
): echarts.EChartsOption {
  return {
    title: {
      text: dataset.title,
      left: 0,
      right: 0,
      width: '100%',
      textStyle: {
        overflow: 'break',
        align: 'center',
        lineHeight: 20,
      },
    },
    dataset: {
      dimensions: dataset.dimensions,
      source: dataset.source,
    },
    legend: {},
    tooltip: {},
  };
}

export function buildSeriesOption(
  dataset: EChartsDataset,
  type: 'bar' | 'line',
): echarts.SeriesOption[] {
  return dataset.series.map((series) => ({
    name: series.name,
    type,
  }));
}
