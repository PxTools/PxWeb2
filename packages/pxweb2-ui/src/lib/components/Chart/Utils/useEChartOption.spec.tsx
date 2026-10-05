import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';
import type { EChartsOption, EChartsType } from 'echarts';

import {
  getEstimatedLegendHeight,
  getFallbackLegendHeight,
  getLegendColumnCount,
  useEChartOption,
} from './useEChartOption';

vi.mock('echarts', () => ({
  init: vi.fn(),
}));

type HookHostProps = {
  option: EChartsOption;
  renderer?: 'canvas' | 'svg';
  onChartRef?: (chartRef: { current: EChartsType | null }) => void;
  onEstimatedLegendHeight?: (height: number | null) => void;
};

function HookHost({
  option,
  renderer,
  onChartRef,
  onEstimatedLegendHeight,
}: Readonly<HookHostProps>) {
  const { divRef, chartRef, estimatedLegendHeight } = useEChartOption(
    option,
    renderer,
  );

  React.useEffect(() => {
    onChartRef?.(chartRef);
  }, [chartRef, onChartRef]);

  React.useEffect(() => {
    onEstimatedLegendHeight?.(estimatedLegendHeight);
  }, [onEstimatedLegendHeight, estimatedLegendHeight]);

  return <div data-testid="chart-root" ref={divRef} />;
}

function createChartMock(width = 320): EChartsType {
  return {
    setOption: vi.fn(),
    getWidth: vi.fn(() => width),
    getHeight: vi.fn(() => 400),
    resize: vi.fn(),
    dispose: vi.fn(),
  } as unknown as EChartsType;
}

describe('useEChartOption', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('selects the requested legend column count at each breakpoint', () => {
    expect(getLegendColumnCount(767)).toBe(1);
    expect(getLegendColumnCount(768)).toBe(2);
    expect(getLegendColumnCount(991)).toBe(2);
    expect(getLegendColumnCount(992)).toBe(3);
    expect(getLegendColumnCount(1399)).toBe(3);
    expect(getLegendColumnCount(1400)).toBe(3);
  });

  it('calculates the minimum height needed for wrapped legend columns', () => {
    expect(
      getEstimatedLegendHeight(320, [
        'Averylongserieslabelthatmustwrapacrossmultiplelines',
        'B',
        'C',
      ]),
    ).toBeGreaterThan(28);
  });

  it('uses the largest breakpoint estimate as the initial fallback height', () => {
    expect(getFallbackLegendHeight(['A', 'B', 'C'])).toBe(
      getEstimatedLegendHeight(320, ['A', 'B', 'C']),
    );
  });

  it('initializes echarts with default svg renderer', () => {
    const chartMock = createChartMock();
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: { text: 'Population' },
    };

    render(<HookHost option={option} />);

    expect(echarts.init).toHaveBeenCalledTimes(1);
    expect(echarts.init).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      null,
      {
        renderer: 'svg',
      },
    );
  });

  it('uses provided renderer when creating chart', () => {
    const chartMock = createChartMock();
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: { text: 'Population' },
    };

    render(<HookHost option={option} renderer="canvas" />);

    expect(echarts.init).toHaveBeenCalledTimes(1);
    expect(echarts.init).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      null,
      {
        renderer: 'canvas',
      },
    );
  });

  it('applies wrapped title style when option has a single title object', () => {
    const chartMock = createChartMock(400);
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: { text: 'Very long chart title' },
    };

    render(<HookHost option={option} />);

    expect(chartMock.setOption).toHaveBeenCalledTimes(1);
    expect(chartMock.setOption).toHaveBeenCalledWith(
      {
        ...option,
        legend: {
          textStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
        },
        tooltip: {
          textStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
        },
        xAxis: {
          axisLabel: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
          axisLine: { lineStyle: { color: '#162327' } },
          nameTextStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
            align: 'left',
          },
        },
        title: {
          ...option.title,
          left: 0,
          right: 0,
          width: '100%',
          textStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
            overflow: 'break',
            width: 368,
            align: 'center',
          },
        },
        yAxis: {
          axisLabel: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
          axisLine: { lineStyle: { color: '#162327' } },
          nameTextStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
            align: 'left',
          },
        },
      },
      { replaceMerge: ['legend'] },
    );
  });

  it('applies global styles when title is not a single title object', () => {
    const chartMock = createChartMock();
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: [{ text: 'Title 1' }, { text: 'Title 2' }],
    };

    render(<HookHost option={option} />);

    expect(chartMock.setOption).toHaveBeenCalledTimes(1);
    expect(chartMock.setOption).toHaveBeenCalledWith(
      {
        ...option,
        title: [
          {
            text: 'Title 1',
            textStyle: {
              fontFamily: 'PxWeb-font, sans-serif',
              fontSize: '0.875rem',
              color: '#162327',
            },
          },
          {
            text: 'Title 2',
            textStyle: {
              fontFamily: 'PxWeb-font, sans-serif',
              fontSize: '0.875rem',
              color: '#162327',
            },
          },
        ],
        legend: {
          textStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
        },
        tooltip: {
          textStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
        },
        xAxis: {
          axisLabel: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
          axisLine: { lineStyle: { color: '#162327' } },
          nameTextStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
            align: 'left',
          },
        },
        yAxis: {
          axisLabel: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          },
          axisLine: { lineStyle: { color: '#162327' } },
          nameTextStyle: {
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
            align: 'left',
          },
        },
      },
      { replaceMerge: ['legend'] },
    );
  });

  it('resizes without rebuilding the chart option on window resize', () => {
    const chartMock = createChartMock(200);
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: { text: 'Population' },
    };

    render(<HookHost option={option} />);

    expect(chartMock.setOption).toHaveBeenCalledTimes(1);

    act(() => {
      globalThis.dispatchEvent(new Event('resize'));
    });

    expect(chartMock.resize).toHaveBeenCalledWith();
    expect(chartMock.setOption).toHaveBeenCalledTimes(1);
  });

  it('does not read rendered legend internals or subscribe to render events', () => {
    const onEstimatedLegendHeight = vi.fn();
    const getModel = vi.fn();
    const getViewOfComponentModel = vi.fn();
    const chartMock = {
      ...createChartMock(1200),
      on: vi.fn(),
      getModel,
      getViewOfComponentModel,
    } as unknown as EChartsType;
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    render(
      <HookHost
        option={{ legend: { data: ['A', 'B', 'C'], orient: 'horizontal' } }}
        onEstimatedLegendHeight={onEstimatedLegendHeight}
      />,
    );

    expect(onEstimatedLegendHeight).toHaveBeenLastCalledWith(20);
    expect(chartMock.on).not.toHaveBeenCalled();
    expect(getModel).not.toHaveBeenCalled();
    expect(getViewOfComponentModel).not.toHaveBeenCalled();
  });

  it('recalculates the legend when the option is rebuilt', () => {
    const chartMock = createChartMock();
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const { rerender } = render(
      <HookHost
        option={{ legend: { data: ['A'], bottom: 0, orient: 'vertical' } }}
      />,
    );

    rerender(
      <HookHost
        option={{
          legend: { data: ['A', 'B'], bottom: 0, orient: 'vertical' },
        }}
      />,
    );

    expect(chartMock.setOption).toHaveBeenLastCalledWith(
      expect.objectContaining({
        legend: expect.objectContaining({
          data: ['A', 'B'],
          orient: 'vertical',
          bottom: 0,
          textStyle: expect.objectContaining({
            fontFamily: 'PxWeb-font, sans-serif',
            fontSize: '0.875rem',
            color: '#162327',
          }),
        }),
      }),
      { replaceMerge: ['legend'] },
    );

    rerender(
      <HookHost
        option={{
          legend: {
            data: ['A', 'B', 'C'],
            bottom: 0,
            orient: 'vertical',
          },
        }}
      />,
    );

    expect(
      (vi.mocked(chartMock.setOption).mock.calls.at(-1)?.[0] as EChartsOption)
        .legend,
    ).toMatchObject({ bottom: 0 });
  });

  it('splits horizontal legends into balanced equal-width columns', () => {
    const chartMock = createChartMock(1200);
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    render(
      <HookHost
        option={{
          legend: {
            data: ['A', 'B', 'C', 'D', 'E'],
            orient: 'horizontal',
          },
        }}
      />,
    );

    const setOption = vi.mocked(chartMock.setOption).mock.calls[0]?.[0] as
      EChartsOption | undefined;
    const legends = setOption?.legend;

    expect(Array.isArray(legends)).toBe(true);
    expect(legends).toHaveLength(3);
    expect(legends).toEqual([
      expect.objectContaining({
        data: ['A', 'B'],
        orient: 'vertical',
        left: 0,
        top: undefined,
        bottom: 0,
        width: 400,
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 8,
        textStyle: expect.objectContaining({ width: 368 }),
      }),
      expect.objectContaining({
        data: ['C', 'D'],
        left: 400,
        top: undefined,
        bottom: 0,
        width: 400,
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 8,
      }),
      expect.objectContaining({
        data: ['E'],
        left: 800,
        top: undefined,
        bottom: 28,
        width: 400,
        itemWidth: 14,
        itemHeight: 14,
        itemGap: 8,
      }),
    ]);
  });

  it('reports the estimated legend height for chart spacing', () => {
    const onEstimatedLegendHeight = vi.fn();
    const getModel = vi.fn();
    const getViewOfComponentModel = vi.fn();
    const chartMock = {
      ...createChartMock(1200),
      getModel,
      getViewOfComponentModel,
    } as unknown as EChartsType;
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    render(
      <HookHost
        option={{
          legend: { data: ['A', 'B', 'C'], orient: 'horizontal' },
        }}
        onEstimatedLegendHeight={onEstimatedLegendHeight}
      />,
    );

    expect(onEstimatedLegendHeight).toHaveBeenLastCalledWith(20);
    expect(getModel).not.toHaveBeenCalled();
    expect(getViewOfComponentModel).not.toHaveBeenCalled();
  });

  it('draws a gridline at the end of a y-axis break', () => {
    const chartMock = {
      ...createChartMock(),
      getModel: vi.fn(() => ({
        getComponent: vi.fn(() => ({
          coordinateSystem: {
            getRect: vi.fn(() => ({ x: 40, y: 20, width: 240, height: 180 })),
          },
        })),
      })),
      convertToPixel: vi.fn((_finder, value: number) =>
        value === 0 ? 210 : 160,
      ),
    } as unknown as EChartsType;
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      yAxis: {
        breaks: [{ start: 0, end: 100 }],
      },
    };

    render(<HookHost option={option} />);

    expect(chartMock.setOption).toHaveBeenLastCalledWith({
      graphic: [
        {
          type: 'line',
          shape: { x1: 40, y1: 160, x2: 280, y2: 160 },
          style: { stroke: '#e0e6f1', lineWidth: 1 },
          silent: true,
          z: 1,
        },
        expect.objectContaining({
          type: 'group',
          left: 34,
          top: 177,
        }),
      ],
    });
  });

  it('disposes chart and clears chartRef on unmount', () => {
    const chartMock = createChartMock();
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: { text: 'Population' },
    };

    const onChartRef = vi.fn();

    const { unmount } = render(
      <HookHost option={option} onChartRef={onChartRef} />,
    );

    const capturedChartRef = onChartRef.mock.calls[0]?.[0];
    expect(capturedChartRef).toBeDefined();
    expect(capturedChartRef?.current).toBe(chartMock);

    unmount();

    expect(chartMock.dispose).toHaveBeenCalledTimes(1);
    expect(capturedChartRef?.current).toBeNull();

    act(() => {
      globalThis.dispatchEvent(new Event('resize'));
    });

    expect(chartMock.resize).toHaveBeenCalledTimes(0);
  });
});
