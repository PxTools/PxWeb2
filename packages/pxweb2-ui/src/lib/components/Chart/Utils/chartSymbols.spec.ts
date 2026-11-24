import { describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';

import { buildDatasetOption, buildSeriesOption } from './chartOptionBuilder';
import { getBarLegendSymbol, getBarTooltipSymbolSvg } from './chartSymbols';
import type { EChartsDataset } from './chartTypes';

const colors = [
  '#123456',
  '#234567',
  '#345678',
  '#456789',
  '#56789a',
  '#6789ab',
];
const dataset: EChartsDataset = {
  title: '',
  origin: '',
  unit: '',
  dimensions: ['name', 'value'],
  source: [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
  ],
  formattedValues: [],
  series: colors.map((_, index) => ({ key: 'value', name: `Series ${index}` })),
};

function normalizedPoints(path: string) {
  const coordinates = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const xs = coordinates.filter((_, index) => index % 2 === 0);
  const ys = coordinates.filter((_, index) => index % 2 === 1);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const width = Math.max(...xs) - minX;
  const height = Math.max(...ys) - minY;
  return coordinates.map((value, index) =>
    index % 2 === 0 ? (value - minX) / width : (value - minY) / height,
  );
}

describe('shared chart symbols', () => {
  it('renders matching line endpoint and legend shapes for every series', () => {
    const canvasContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    const chart = echarts.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 800,
      height: 400,
    });

    try {
      chart.setOption({
        ...buildDatasetOption(dataset),
        animation: false,
        xAxis: { type: 'category' },
        yAxis: { type: 'value' },
        series: buildSeriesOption(dataset, 'line', colors),
      });
      const svg = chart.renderToSVGString();
      const document = new DOMParser().parseFromString(svg, 'image/svg+xml');

      expect(svg).not.toContain('data:image');
      colors.forEach((color, index) => {
        const endpoint = document.querySelector(
          `path[fill="${color}"][ecmeta_series_index="${index}"][ecmeta_data_index="1"]`,
        );
        const legend = Array.from(
          document.querySelectorAll(`path[fill="${color}"]`),
        ).find((element) => !element.hasAttribute('ecmeta_series_index'));
        const endpointPath = endpoint?.getAttribute('d');
        const legendPath = legend?.getAttribute('d');
        expect(endpointPath).toBeTruthy();
        expect(legendPath).toBeTruthy();
        if (index >= 2 && endpointPath && legendPath) {
          const endpointPoints = normalizedPoints(endpointPath);
          const legendPoints = normalizedPoints(legendPath);
          expect(legendPoints).toHaveLength(endpointPoints.length);
          endpointPoints.forEach((point, coordinate) =>
            expect(Math.abs(legendPoints[coordinate] - point)).toBeLessThan(
              0.12,
            ),
          );
        }
      });
      chart.dispatchAction({ type: 'legendToggleSelect', name: 'Series 2' });
      const hidden = new DOMParser().parseFromString(
        chart.renderToSVGString(),
        'image/svg+xml',
      );
      expect(
        hidden.querySelector(
          '[ecmeta_ssr_type="chart"][ecmeta_series_index="2"]',
        ),
      ).toBeNull();
      expect(
        hidden.querySelector(
          '[ecmeta_ssr_type="chart"][ecmeta_series_index="1"]',
        ),
      ).not.toBeNull();
    } finally {
      chart.dispose();
      canvasContext.mockRestore();
    }
  });

  it('renders a rounded bar legend icon and preserves legend selection', () => {
    const canvasContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    const chart = echarts.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 600,
      height: 400,
    });
    const barDataset = { ...dataset, series: dataset.series.slice(0, 1) };
    try {
      chart.setOption({
        ...buildDatasetOption(barDataset),
        animation: false,
        legend: { icon: getBarLegendSymbol() },
        xAxis: { type: 'category' },
        yAxis: { type: 'value' },
        series: buildSeriesOption(barDataset, 'bar', colors),
      });
      const svg = chart.renderToSVGString();
      const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
      const legend = document.querySelector(
        'path[ecmeta_ssr_type="legend"][fill="#123456"]',
      );
      expect(legend?.getAttribute('d')).toMatch(/[AC]/);
      expect(getBarTooltipSymbolSvg('#123456')).toContain('rx="2"');
      expect(svg).not.toContain('data:image');

      chart.dispatchAction({ type: 'legendToggleSelect', name: 'Series 0' });
      const hidden = new DOMParser().parseFromString(
        chart.renderToSVGString(),
        'image/svg+xml',
      );
      expect(hidden.querySelector('[ecmeta_ssr_type="chart"]')).toBeNull();
    } finally {
      chart.dispose();
      canvasContext.mockRestore();
    }
  });
});
