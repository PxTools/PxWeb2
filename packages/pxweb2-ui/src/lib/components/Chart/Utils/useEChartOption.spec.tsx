import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';
import type { EChartsOption, EChartsType } from 'echarts';

import { useEChartOption } from './useEChartOption';

vi.mock('echarts', () => ({
  init: vi.fn(),
}));

type HookHostProps = {
  option: EChartsOption;
  renderer?: 'canvas' | 'svg';
  onChartRef?: (chartRef: { current: EChartsType | null }) => void;
};

function HookHost({ option, renderer, onChartRef }: Readonly<HookHostProps>) {
  const { divRef, chartRef } = useEChartOption(option, renderer);

  React.useEffect(() => {
    onChartRef?.(chartRef);
  }, [chartRef, onChartRef]);

  return <div data-testid="chart-root" ref={divRef} />;
}

function createChartMock(width = 320): EChartsType {
  return {
    setOption: vi.fn(),
    getWidth: vi.fn(() => width),
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
    expect(chartMock.setOption).toHaveBeenCalledWith({
      ...option,
      title: {
        ...option.title,
        left: 0,
        right: 0,
        width: '100%',
        textStyle: {
          overflow: 'break',
          width: 368,
          align: 'center',
        },
      },
    });
  });

  it('passes option unchanged when title is not a single title object', () => {
    const chartMock = createChartMock();
    vi.mocked(echarts.init).mockReturnValue(chartMock);

    const option: EChartsOption = {
      title: [{ text: 'Title 1' }, { text: 'Title 2' }],
    };

    render(<HookHost option={option} />);

    expect(chartMock.setOption).toHaveBeenCalledTimes(1);
    expect(chartMock.setOption).toHaveBeenCalledWith(option);
  });

  it('resizes and reapplies wrapped title on window resize', () => {
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

    expect(chartMock.resize).toHaveBeenCalledTimes(1);
    expect(chartMock.setOption).toHaveBeenCalledTimes(2);
    expect(chartMock.setOption).toHaveBeenLastCalledWith({
      ...option,
      title: {
        ...option.title,
        left: 0,
        right: 0,
        width: '100%',
        textStyle: {
          overflow: 'break',
          width: 168,
          align: 'center',
        },
      },
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
