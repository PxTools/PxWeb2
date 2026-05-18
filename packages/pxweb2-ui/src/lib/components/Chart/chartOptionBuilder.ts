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
    // Add origin in bottom-left corner of the chart canvas
    graphic: [
      {
        type: 'text',
        left: 8,
        bottom: 8,
        silent: true, // don't capture mouse events
        style: {
          text: `Source: ${dataset.origin}`,
          fill: '#6b7280',
          font: '12px sans-serif',
        },
      },
    ],
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
