import type * as echarts from 'echarts';

import type { EChartsDataset } from './chartTypes';

type LineSeriesSymbol =
  | 'circle'
  | 'rect'
  | 'triangle'
  | 'diamond'
  | 'pin'
  | 'arrow';

export const LINE_SERIES_SYMBOLS: LineSeriesSymbol[] = [
  'circle',
  'rect',
  'triangle',
  'diamond',
  'pin',
  'arrow',
];

export function buildDatasetOption(
  dataset: EChartsDataset,
): echarts.EChartsOption {
  return {
    // TODO: Title and source should only be displayed when chart is exported as image, not when rendered in the browser.
    // title: {
    //   text: dataset.title,
    //   left: 0,
    //   right: 0,
    //   width: '100%',
    //   textStyle: {
    //     overflow: 'break',
    //     align: 'center',
    //     lineHeight: 20,
    //   },
    // },
    // // Add origin in bottom-left corner of the chart canvas
    // graphic: [
    //   {
    //     type: 'text',
    //     left: 8,
    //     bottom: 8,
    //     silent: true, // don't capture mouse events
    //     style: {
    //       text: `Source: ${dataset.origin}`,
    //       fill: '#6b7280',
    //       font: '12px sans-serif',
    //     },
    //   },
    // ],
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
  colors?: string[],
): echarts.SeriesOption[] {
  return dataset.series.map((series, index) => {
    const baseSeries: echarts.SeriesOption = {
      name: series.name,
      type,
      color: colors ? colors[index % colors.length] : undefined,
    };

    if (type === 'line') {
      return {
        ...baseSeries,
        symbol: LINE_SERIES_SYMBOLS[index % LINE_SERIES_SYMBOLS.length],
        symbolSize: 8,
      };
    }

    return baseSeries;
  });
}
