import * as echarts from 'echarts';

import { applyYAxisBreakMark } from '../Utils/useEChartOption';

type ChartImageType = 'png' | 'svg';
const LEGEND_BOTTOM_GAP_PX = 80;
const EXPORT_EXTRA_X_AXIS_LEGEND_GAP_PX = 16;

export async function downloadChartImage(
  chart: echarts.EChartsType | null,
  tabId: string,
  type: ChartImageType,
) {
  if (!chart || chart.isDisposed()) {
    return;
  }

  const filename = (tabId.trim() || 'PxWebDownload')
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-|-$/g, '');

  chart.setOption({
    title: [{ show: true }, { show: true }],
  });

  try {
    await exportChartImage(chart, filename || 'chart', type);
  } finally {
    chart.setOption({
      title: [{ show: false }, { show: false }],
    });
  }
}
async function exportChartImage(
  sourceChart: echarts.EChartsType,
  fileName: string,
  type: ChartImageType,
) {
  const renderer = type === 'png' ? 'canvas' : 'svg';
  const { chart: exportChart, container } = await createExportChart(
    sourceChart,
    renderer,
  );

  try {
    const dataUrl = exportChart.getDataURL({
      type,
      ...(type === 'png' ? { pixelRatio: 2 } : {}),
      backgroundColor: '#fff',
    });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${fileName}.${type}`;
    link.click();
  } finally {
    exportChart.dispose();
    container.remove();
  }
}
async function createExportChart(
  sourceChart: echarts.EChartsType,
  renderer: 'canvas' | 'svg',
) {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';

  const width = sourceChart.getWidth();
  const height = sourceChart.getHeight();

  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  document.body.appendChild(container);

  let exportChart: echarts.EChartsType | undefined;
  try {
    const chart = echarts.init(container, null, { renderer });
    exportChart = chart;

    const option = sourceChart.getOption();

    option.animation = false;
    const legends = option.legend ?? [];
    const legendOptions = Array.isArray(legends) ? legends : [legends];
    option.legend = legendOptions.map((legend) => ({
      ...legend,
      bottom:
        (typeof legend.bottom === 'number' ? legend.bottom : 0) +
        LEGEND_BOTTOM_GAP_PX,
    }));
    if (option.grid) {
      const grids = Array.isArray(option.grid) ? option.grid : [option.grid];
      const gridShift =
        LEGEND_BOTTOM_GAP_PX + EXPORT_EXTRA_X_AXIS_LEGEND_GAP_PX;
      option.grid = grids.map((grid) => ({
        ...grid,
        ...(typeof grid.height === 'number'
          ? { height: Math.max(0, grid.height - gridShift) }
          : {}),
        ...(typeof grid.bottom === 'number'
          ? { bottom: grid.bottom + gridShift }
          : {}),
      }));
    }

    await new Promise<void>((resolve) => {
      const handler = () => {
        chart.off('finished', handler);
        resolve();
      };

      chart.on('finished', handler);
      chart.setOption(option, true);
    });
    applyYAxisBreakMark(chart, option as echarts.EChartsOption);

    return { chart, container };
  } catch (error) {
    exportChart?.dispose();
    container.remove();
    throw error;
  }
}

export async function exportPngFromSvgChart(
  sourceChart: echarts.EChartsType,
  fileName: string,
) {
  await exportChartImage(sourceChart, fileName, 'png');
}
