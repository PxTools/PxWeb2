import type {
  EChartsOption,
  EChartsType,
  LegendComponentOption,
} from 'echarts';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applyLegendGap,
  applyResponsiveLegend,
  createLegendLayoutController,
  getEstimatedLegendHeight,
  getFallbackLegendHeight,
  getGridRect,
  getLegendColumnCount,
  getRenderedLegendHeight,
  getRenderedXAxisExtentBelowGrid,
} from './chartLegendHelper';

function createChartMock(width = 320, model: Record<string, unknown> = {}) {
  return {
    getWidth: vi.fn(() => width),
    getModel: vi.fn(() => model),
    getViewOfComponentModel: vi.fn(),
    setOption: vi.fn(),
    resize: vi.fn(),
  } as unknown as EChartsType;
}

function createRenderedLegendChart(heights: number[]) {
  const legendModels = heights.map((height) => ({ height }));
  const chart = createChartMock(320, {
    getComponentsByType: (type: string) =>
      type === 'legend' ? legendModels : [],
  });
  const measurableChart = chart as unknown as {
    getViewOfComponentModel: (model: { height: number }) => {
      group: { getBoundingRect: () => { y: number; height: number } };
    };
  };
  measurableChart.getViewOfComponentModel = (model) => ({
    group: {
      getBoundingRect: () => ({ y: 0, height: model.height }),
    },
  });
  return chart;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getLegendColumnCount', () => {
  it('selects one, two, or three columns at the responsive breakpoints', () => {
    expect(getLegendColumnCount(767)).toBe(1);
    expect(getLegendColumnCount(768)).toBe(2);
    expect(getLegendColumnCount(991)).toBe(2);
    expect(getLegendColumnCount(992)).toBe(3);
  });
});

describe('legend height estimates', () => {
  it('returns null when there are no legend entries', () => {
    expect(getEstimatedLegendHeight(320, undefined)).toBeNull();
    expect(getEstimatedLegendHeight(320, [])).toBeNull();
  });

  it('estimates the tallest balanced column and falls back to the largest breakpoint estimate', () => {
    const data = ['A', 'B', 'C'];

    expect(getEstimatedLegendHeight(320, data, 14)).toBe(76);
    expect(getEstimatedLegendHeight(768, data, 14)).toBe(48);
    expect(getEstimatedLegendHeight(1200, data, 14)).toBe(20);
    expect(getFallbackLegendHeight(data)).toBe(76);
  });

  it('returns zero as the fallback when there is no data', () => {
    expect(getFallbackLegendHeight(undefined)).toBe(0);
    expect(getFallbackLegendHeight([])).toBe(0);
  });
});

describe('applyResponsiveLegend', () => {
  it('splits horizontal legend data into balanced vertical columns', () => {
    const chart = createChartMock(768);
    const option: EChartsOption = {
      legend: {
        data: ['A', 'B', 'C', 'D', 'E'],
        textStyle: { color: '#123456' },
      },
    };

    const result = applyResponsiveLegend(chart, option);
    const legends = result.legend as LegendComponentOption[];

    expect(legends).toHaveLength(2);
    expect(legends.map((legend) => legend.data)).toEqual([
      ['A', 'B', 'C'],
      ['D', 'E'],
    ]);
    expect(legends.map((legend) => legend.left)).toEqual([0, 384]);
    expect(legends.map((legend) => legend.bottom)).toEqual([0, 28]);
    expect(legends[0].orient).toBe('vertical');
    expect(legends[0].textStyle).toMatchObject({
      color: '#123456',
      width: 352,
      lineHeight: 20,
    });
    expect(option.legend).toMatchObject({ data: ['A', 'B', 'C', 'D', 'E'] });
  });

  it('wraps legend labels at word boundaries to the available column width', () => {
    const chart = createChartMock(100);
    const result = applyResponsiveLegend(chart, {
      legend: { data: ['ABCDEFGHIJ KLM'] },
    });
    const legend = (result.legend as LegendComponentOption[])[0];

    expect(legend.formatter).toBeTypeOf('function');
    expect(
      (legend.formatter as (name: string) => string)('ABCDEFGHIJ KLM'),
    ).toBe('ABCDEFGHIJ\nKLM');
  });

  it('leaves a single vertical legend unchanged', () => {
    const option: EChartsOption = {
      legend: { orient: 'vertical', data: ['A'] },
    };

    expect(applyResponsiveLegend(createChartMock(), option)).toBe(option);
  });

  it('sets a width for vertical legends in a legend array', () => {
    const result = applyResponsiveLegend(createChartMock(400), {
      legend: [{ orient: 'vertical', data: ['A'] }],
    });
    const legend = (result.legend as LegendComponentOption[])[0];

    expect(legend.width).toBe(400);
    expect(legend.textStyle).toMatchObject({ width: 360 });
  });
});

describe('ECharts geometry measurements', () => {
  it('returns the grid rectangle when available and null otherwise', () => {
    const rect = { x: 12, y: 24, width: 300, height: 200 };
    const chartWithGrid = createChartMock(320, {
      getComponent: (type: string) =>
        type === 'grid'
          ? { coordinateSystem: { getRect: () => rect } }
          : undefined,
    });

    expect(getGridRect(chartWithGrid)).toEqual(rect);
    expect(getGridRect(createChartMock())).toBeNull();
  });

  it('uses the tallest finite rendered legend height', () => {
    expect(
      getRenderedLegendHeight(createRenderedLegendChart([24, 48, 36])),
    ).toBe(48);
    expect(getRenderedLegendHeight(createChartMock())).toBeNull();
  });

  it('measures only x-axis overflow below the grid', () => {
    const chart = createChartMock(320, {
      getComponent: (type: string) =>
        type === 'grid'
          ? {
              coordinateSystem: {
                getRect: () => ({ x: 0, y: 100, width: 320, height: 200 }),
              },
            }
          : undefined,
      getComponentsByType: (type: string) =>
        type === 'xAxis'
          ? [
              {
                axis: {
                  axisBuilder: {
                    group: {
                      getBoundingRect: () => ({ y: 295, height: 30 }),
                    },
                  },
                },
              },
            ]
          : [],
    });

    expect(getRenderedXAxisExtentBelowGrid(chart)).toBe(25);
    expect(getRenderedXAxisExtentBelowGrid(createChartMock())).toBe(0);
  });
});

describe('applyLegendGap', () => {
  it('sets the grid bottom from axis overflow, legend height, and requested gap', () => {
    const gridModel = { option: { bottom: 60 } };
    const chart = createRenderedLegendChart([40]);
    const measurableChart = chart as unknown as {
      getModel: () => {
        getComponent: (type: string) => unknown;
        getComponentsByType: (type: string) => unknown[];
      };
    };
    measurableChart.getModel = () => ({
      getComponent: (type) =>
        type === 'grid'
          ? {
              ...gridModel,
              coordinateSystem: {
                getRect: () => ({ x: 0, y: 100, width: 320, height: 200 }),
              },
            }
          : undefined,
      getComponentsByType: (type) =>
        type === 'legend'
          ? [{ height: 40 }]
          : type === 'xAxis'
            ? [
                {
                  axis: {
                    axisBuilder: {
                      group: {
                        getBoundingRect: () => ({ y: 295, height: 30 }),
                      },
                    },
                  },
                },
              ]
            : [],
    });

    applyLegendGap(chart, { grid: { left: 10, bottom: 60 } }, 10);

    expect(chart.setOption).toHaveBeenCalledWith({
      grid: { left: 10, bottom: 75 },
    });
  });

  it('does not update the grid until the legend has rendered', () => {
    const chart = createChartMock();

    applyLegendGap(chart, { grid: { bottom: 40 } }, 10);

    expect(chart.setOption).not.toHaveBeenCalled();
  });
});

describe('createLegendLayoutController', () => {
  it('uses the estimated height before ECharts exposes rendered measurements', () => {
    const chart = createChartMock(320);
    const setRenderedLegendHeight = vi.fn();
    const applyOption = vi.fn();
    const controller = createLegendLayoutController({
      chart,
      chartContainer: { clientWidth: 320 } as HTMLDivElement,
      option: { legend: { data: ['A', 'B'] } },
      lastRenderedLegendHeightRef: { current: null },
      legendLayoutInvalidatedRef: { current: false },
      setRenderedLegendHeight,
      applyOption,
    });

    controller.update();

    expect(setRenderedLegendHeight).toHaveBeenCalledWith(48);
    expect(applyOption).not.toHaveBeenCalled();
  });
});
