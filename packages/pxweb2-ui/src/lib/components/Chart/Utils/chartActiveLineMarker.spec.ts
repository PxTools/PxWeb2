import { describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';

import { createActiveLineMarker } from './chartActiveLineMarker';
import { buildDatasetOption, buildSeriesOption } from './chartOptionBuilder';
import { getLineTooltipSymbolSvg } from './chartSymbols';
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
      series: Array.from({ length: 7 }, (_, index) => ({
        key: 'value',
        name: `Value ${index}`,
      })),
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
      const marker = createActiveLineMarker(chart, dataset);
      const before = chart.renderToSVGString();

      marker.update({ seriesIndex: 0, dataIndex: 1, color: '#abcdef' });
      vi.advanceTimersByTime(20);
      const withMarker = chart.renderToSVGString();
      expect(before).toContain('#123456');
      expect(before).toContain('#778899');
      expect(before).toContain('#334455');
      expect(before).not.toContain('#abcdef');
      expect(withMarker).toContain('#123456');
      expect(withMarker).toContain('#778899');
      expect(withMarker).toContain('#334455');
      expect(withMarker).toContain('#abcdef');
      expect(withMarker).not.toContain('<image');
      expect(withMarker).not.toContain('data:image');

      const expectCenteredAndScaled = (shape: Element) => {
        const transform = shape.getAttribute('transform');
        const values = transform
          ?.match(/^matrix\(([^)]+)\)$/)?.[1]
          .split(/[\s,]+/)
          .map(Number);
        expect(values).toHaveLength(6);
        if (!values || values.length !== 6) {
          throw new Error(`Unexpected marker transform: ${transform}`);
        }
        const [x, y] = chart.convertToPixel(
          { xAxisIndex: 0, yAxisIndex: 0 },
          [1, 20],
        );
        expect(values[0]).toBe(1.5);
        expect(values[1]).toBe(0);
        expect(values[2]).toBe(0);
        expect(values[3]).toBe(1.5);
        expect(values[4] + 5 * values[0]).toBeCloseTo(x, 1);
        expect(values[5] + 5 * values[3]).toBeCloseTo(y, 1);
      };

      const shapes: string[] = [];
      for (
        let seriesIndex = 0;
        seriesIndex < dataset.series.length;
        seriesIndex++
      ) {
        marker.update({ seriesIndex, dataIndex: 1, color: '#abcdef' });
        vi.advanceTimersByTime(20);
        const svg = chart.renderToSVGString();
        const document = new DOMParser().parseFromString(svg, 'image/svg+xml');
        const activeShape = document.querySelector('[fill="#abcdef"]');
        if (!activeShape) {
          throw new Error(`Missing active marker for series ${seriesIndex}`);
        }
        expectCenteredAndScaled(activeShape);
        const tooltip = new DOMParser().parseFromString(
          getLineTooltipSymbolSvg('#abcdef', seriesIndex),
          'image/svg+xml',
        );
        const tooltipShape = tooltip.documentElement.firstElementChild;
        if (tooltipShape?.tagName === 'rect') {
          const x = Number(tooltipShape.getAttribute('x'));
          const y = Number(tooltipShape.getAttribute('y'));
          const width = Number(tooltipShape.getAttribute('width'));
          const height = Number(tooltipShape.getAttribute('height'));
          expect(activeShape.tagName).toBe('path');
          expect(activeShape.getAttribute('d')).toBe(
            `M${x} ${y}l${width} 0l0 ${height}l${-width} 0Z`,
          );
        } else if (tooltipShape?.tagName === 'circle') {
          expect(activeShape.tagName).toBe('circle');
          for (const attribute of ['cx', 'cy', 'r']) {
            expect(activeShape.getAttribute(attribute)).toBe(
              tooltipShape.getAttribute(attribute),
            );
          }
        } else if (tooltipShape?.tagName === 'polygon') {
          expect(activeShape.tagName).toBe('polygon');
          const toNumbers = (points: string | null) =>
            points
              ?.trim()
              .split(/[\s,]+/)
              .map(Number);
          const renderedPoints = toNumbers(activeShape.getAttribute('points'));
          const tooltipPoints = toNumbers(tooltipShape.getAttribute('points'));
          expect(renderedPoints).toHaveLength(tooltipPoints?.length ?? 0);
          tooltipPoints?.forEach((value, index) => {
            const rendered = renderedPoints?.[index];
            expect(rendered).toBeDefined();
            if (rendered !== undefined) {
              expect(Math.abs(rendered - value)).toBeLessThan(0.051);
            }
          });
        } else {
          throw new Error(
            `Unexpected tooltip symbol for series ${seriesIndex}`,
          );
        }
        activeShape.removeAttribute('class');
        const shape = activeShape.outerHTML;
        if (seriesIndex < 6) {
          expect(shapes).not.toContain(shape);
          shapes.push(shape);
        } else {
          expect(shape).toBe(shapes[0]);
        }
        expect(svg).not.toContain('<image');
        expect(svg).not.toContain('data:image');
      }

      chart.resize({ width: 800, height: 400 });
      marker.reposition();
      vi.advanceTimersByTime(20);
      const resizedSvg = chart.renderToSVGString();
      const resizedDocument = new DOMParser().parseFromString(
        resizedSvg,
        'image/svg+xml',
      );
      const resizedMarker = resizedDocument.querySelector('[fill="#abcdef"]');
      expect(resizedMarker).not.toBeNull();
      if (resizedMarker) {
        expectCenteredAndScaled(resizedMarker);
      }

      marker.clear();
      vi.advanceTimersByTime(20);
      expect(chart.renderToSVGString()).not.toContain('#abcdef');
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
