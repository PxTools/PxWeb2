import type * as echarts from 'echarts';

import type { EChartsDataset } from './chartTypes';

type LineSeriesSymbol =
  'circle' | 'rect' | 'triangle' | 'diamond' | 'pin' | 'arrow';

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
    const baseSeries = {
      name: series.name,
      color: colors ? colors[index % colors.length] : undefined,
    };

    if (type === 'line') {
      let lastDataIndex = dataset.source.length - 1;
      // Show one symbol per line, on its latest valid data point. Search backward so trailing
      // missing or non-numeric values don't prevent that symbol from being shown.
      while (lastDataIndex >= 0) {
        const value = dataset.source[lastDataIndex][series.key];
        if (typeof value === 'number' && Number.isFinite(value)) {
          break;
        }
        lastDataIndex -= 1;
      }

      return {
        ...baseSeries,
        type: 'line',
        symbol: LINE_SERIES_SYMBOLS[index % LINE_SERIES_SYMBOLS.length],
        // Use size 8 for the latest valid point's marker and size 0 to hide markers on the rest.
        symbolSize: (_value, params) =>
          params.dataIndex === lastDataIndex ? 8 : 0,
        showAllSymbol: true,
        // Enable events on the line path so the tooltip can track the hovered series.
        triggerEvent: 'line',
        emphasis: { scale: 1.5 },
      };
    }

    return {
      ...baseSeries,
      type: 'bar',
      barMaxWidth: 100,
    };
  });
}
