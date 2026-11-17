import { describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';

import { createActiveLineMarker } from './chartActiveLineMarker';
import { buildDatasetOption, buildSeriesOption } from './chartOptionBuilder';
import type { EChartsDataset } from './chartTypes';

describe('active line marker', () => {
  it('renders the selected point without replacing the last-point marker', () => {
    vi.useFakeTimers();
    const canvasContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);
    const dataset: EChartsDataset = {
      title: '',
      origin: '',
      unit: '',
      dimensions: ['name', 'value'],
      source: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
        { name: 'C', value: 30 },
      ],
      formattedValues: [],
      series: [{ key: 'value', name: 'Value' }],
    };
    const chart = echarts.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 600,
      height: 400,
    });

    try {
      chart.setOption({
        ...buildDatasetOption(dataset),
        animation: false,
        xAxis: { type: 'category' },
        yAxis: { type: 'value' },
        series: buildSeriesOption(dataset, 'line', ['#123456']),
        graphic: [
          {
            id: 'existing-graphic',
            type: 'circle',
            shape: { cx: 5, cy: 5, r: 3 },
            style: { fill: '#778899' },
          },
          {
            type: 'line',
            shape: { x1: 10, y1: 10, x2: 20, y2: 20 },
            style: { stroke: '#334455' },
          },
        ],
      });
      const marker = createActiveLineMarker(
        chart,
        dataset,
        (color) =>
          `<svg xmlns="http://www.w3.org/2000/svg"><circle fill="${color}"/></svg>`,
      );
      const before = chart.renderToSVGString();

      marker.update({ seriesIndex: 0, dataIndex: 1, color: '#abcdef' });
      vi.advanceTimersByTime(20);
      const withMarker = chart.renderToSVGString();
      expect(before).toContain('#123456');
      expect(before).toContain('#778899');
      expect(before).toContain('#334455');
      expect(before).not.toContain('%23abcdef');
      expect(withMarker).toContain('#123456');
      expect(withMarker).toContain('#778899');
      expect(withMarker).toContain('#334455');
      expect(withMarker).toContain('%23abcdef');

      chart.resize({ width: 800, height: 400 });
      marker.reposition();
      vi.advanceTimersByTime(20);
      expect(chart.renderToSVGString()).toContain('%23abcdef');

      marker.clear();
      vi.advanceTimersByTime(20);
      expect(chart.renderToSVGString()).not.toContain('%23abcdef');
      expect(chart.renderToSVGString()).toContain('#778899');
      expect(chart.renderToSVGString()).toContain('#334455');
      marker.dispose();
    } finally {
      chart.dispose();
      canvasContext.mockRestore();
      vi.useRealTimers();
    }
  });
});
