import type * as echarts from 'echarts';

import type { EChartsDataset } from './chartTypes';

export const ACTIVE_LINE_MARKER_ID = 'pxweb-active-line-marker';

interface ActiveLinePoint {
  seriesIndex: number;
  dataIndex?: number;
  color?: string;
}

export function createActiveLineMarker(
  chart: Pick<
    echarts.EChartsType,
    'convertToPixel' | 'isDisposed' | 'setOption'
  >,
  dataset: EChartsDataset,
  getTooltipSymbolSvg: (color: string, seriesIndex: number) => string,
) {
  let activePoint: ActiveLinePoint | undefined;
  let frame: number | undefined;
  let renderedKey: string | undefined;

  const render = () => {
    frame = undefined;
    if (chart.isDisposed()) {
      return;
    }

    if (!activePoint || activePoint.dataIndex == null) {
      if (renderedKey !== undefined) {
        chart.setOption(
          { graphic: [{ id: ACTIVE_LINE_MARKER_ID, $action: 'remove' }] },
          { silent: true },
        );
        renderedKey = undefined;
      }
      return;
    }

    const series = dataset.series[activePoint.seriesIndex];
    const value = dataset.source[activePoint.dataIndex]?.[series.key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      activePoint = undefined;
      render();
      return;
    }
    const [x, y] = chart.convertToPixel({ xAxisIndex: 0, yAxisIndex: 0 }, [
      activePoint.dataIndex,
      value,
    ]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      activePoint = undefined;
      render();
      return;
    }

    const color = activePoint.color ?? '#666666';
    const key = JSON.stringify([x, y, activePoint.seriesIndex, color]);
    if (key === renderedKey) {
      return;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">${getTooltipSymbolSvg(color, activePoint.seriesIndex)}</svg>`;
    chart.setOption(
      {
        graphic: [
          {
            id: ACTIVE_LINE_MARKER_ID,
            type: 'image',
            $action: 'replace',
            x: x - 5,
            y: y - 5,
            style: {
              image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
              width: 10,
              height: 10,
            },
            silent: true,
            z: 100,
            enterAnimation: { duration: 0 },
            updateAnimation: { duration: 0 },
          },
        ],
      },
      { silent: true },
    );
    renderedKey = key;
  };

  // setOption cannot run during ECharts' tooltip rendering/update cycle.
  const schedule = () => {
    if (frame === undefined) {
      frame = requestAnimationFrame(render);
    }
  };

  const clear = () => {
    activePoint = undefined;
    schedule();
  };

  const update = (point: ActiveLinePoint | undefined) => {
    const series = point && dataset.series[point.seriesIndex];
    const value =
      series && point?.dataIndex != null
        ? dataset.source[point.dataIndex]?.[series.key]
        : undefined;
    activePoint =
      point && typeof value === 'number' && Number.isFinite(value)
        ? point
        : undefined;
    schedule();
  };

  const dispose = () => {
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      frame = undefined;
    }
    activePoint = undefined;
    if (renderedKey !== undefined && !chart.isDisposed()) {
      render();
    }
  };

  return { update, clear, reposition: schedule, dispose };
}
