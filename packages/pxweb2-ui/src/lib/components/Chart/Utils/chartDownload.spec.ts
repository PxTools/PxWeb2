import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as echarts from 'echarts';

import { downloadChartImage, exportPngFromSvgChart } from './chartDownload';
import { applyYAxisBreakMark } from './useEChartOption';

vi.mock('echarts', () => ({
  init: vi.fn(),
}));

vi.mock('./useEChartOption', () => ({
  applyYAxisBreakMark: vi.fn(),
  useEChartOption: vi.fn(),
}));

describe('chartDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('preserves PNG legend spacing and adds a wider gap after the x-axis', async () => {
    let finishedHandler: (() => void) | undefined;
    const exportChart = {
      on: vi.fn((_event: string, handler: () => void) => {
        finishedHandler = handler;
      }),
      off: vi.fn(),
      setOption: vi.fn(() => finishedHandler?.()),
      getDataURL: vi.fn(() => 'data:image/png;base64,chart'),
      dispose: vi.fn(),
    };
    vi.mocked(echarts.init).mockReturnValue(
      exportChart as unknown as echarts.EChartsType,
    );
    const sourceChart = {
      getWidth: vi.fn(() => 400),
      getHeight: vi.fn(() => 300),
      getOption: vi.fn(() => ({
        legend: [{ bottom: 0 }, { bottom: 20 }],
        grid: [{ height: 476, bottom: 136 }],
      })),
    } as unknown as echarts.EChartsType;
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    await exportPngFromSvgChart(sourceChart, 'chart');

    const exportContainer = vi.mocked(echarts.init).mock.calls[0][0];
    expect(exportContainer).toMatchObject({
      style: { width: '400px', height: '300px' },
    });
    expect(exportChart.setOption).toHaveBeenCalledWith(
      expect.objectContaining({
        animation: false,
        legend: [{ bottom: 80 }, { bottom: 100 }],
        grid: [{ height: 380, bottom: 232 }],
      }),
      true,
    );
    expect(applyYAxisBreakMark).toHaveBeenCalledWith(
      exportChart,
      expect.objectContaining({
        grid: [{ height: 380, bottom: 232 }],
      }),
    );
    expect(
      vi.mocked(applyYAxisBreakMark).mock.invocationCallOrder[0],
    ).toBeLessThan(exportChart.getDataURL.mock.invocationCallOrder[0]);
    expect(exportChart.getDataURL).toHaveBeenCalledWith({
      type: 'png',
      pixelRatio: 2,
      backgroundColor: '#fff',
    });
    anchorClick.mockRestore();
  });

  it('uses the adjusted export layout for SVG downloads', async () => {
    let finishedHandler: (() => void) | undefined;
    const exportChart = {
      on: vi.fn((_event: string, handler: () => void) => {
        finishedHandler = handler;
      }),
      off: vi.fn(),
      setOption: vi.fn(() => finishedHandler?.()),
      getDataURL: vi.fn(() => 'data:image/svg+xml,chart'),
      dispose: vi.fn(),
    };
    vi.mocked(echarts.init).mockReturnValue(
      exportChart as unknown as echarts.EChartsType,
    );
    const sourceChart = {
      isDisposed: vi.fn(() => false),
      setOption: vi.fn(),
      getWidth: vi.fn(() => 400),
      getHeight: vi.fn(() => 300),
      getOption: vi.fn(() => ({
        title: [{ text: 'Population by year' }],
        legend: [{ bottom: 0 }, { bottom: 20 }],
        grid: [{ height: 476, bottom: 136 }],
      })),
    } as unknown as echarts.EChartsType;
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    await downloadChartImage(sourceChart, '', 'svg');

    expect(echarts.init).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      null,
      { renderer: 'svg' },
    );
    expect(exportChart.setOption).toHaveBeenCalledWith(
      expect.objectContaining({
        legend: [{ bottom: 80 }, { bottom: 100 }],
        grid: [{ height: 380, bottom: 232 }],
      }),
      true,
    );
    expect(applyYAxisBreakMark).toHaveBeenCalledWith(
      exportChart,
      expect.objectContaining({
        grid: [{ height: 380, bottom: 232 }],
      }),
    );
    expect(exportChart.getDataURL).toHaveBeenCalledWith({
      type: 'svg',
      backgroundColor: '#fff',
    });

    anchorClick.mockRestore();
  });
});
