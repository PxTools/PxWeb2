import type * as echarts from 'echarts';

import { getLineSymbol } from './chartSymbols';
import type { EChartsDataset } from './chartTypes';

export const ACTIVE_LINE_MARKER_ID = 'pxweb-active-line-marker';
const ACTIVE_MARKER_SCALE = 1.5;
const SYMBOL_CENTER = 5;

// Identifies the chart point that the active line marker should highlight.
interface ActiveLinePoint {
  // Index of the point's series in the chart dataset.
  seriesIndex: number;
  // Index of the point's value in the dataset's source rows.
  dataIndex?: number;
  // Optional marker color; the series' default color is used when omitted.
  color?: string;
}

export function createActiveLineMarker(
  chart: Pick<
    echarts.EChartsType,
    'convertToPixel' | 'isDisposed' | 'setOption'
  >,
  dataset: EChartsDataset,
) {
  // The point the enlarged marker should show; undefined means there is none.
  let activePoint: ActiveLinePoint | undefined;
  // ID of the queued render, so multiple updates can share one animation frame.
  let frame: number | undefined;
  // Identifies the marker's last rendered position and style to skip duplicates.
  let renderedKey: string | undefined;

  // Draws the enlarged marker for the active point. It looks up the point's
  // value, converts its data position to pixels, and updates the chart graphic.
  // If there is no valid point, it removes any existing marker.
  const render = () => {
    frame = undefined;
    if (chart.isDisposed()) {
      return;
    }

    // Without a point index there is nothing to draw, so remove any old marker.
    if (activePoint?.dataIndex == null) {
      if (renderedKey !== undefined) {
        chart.setOption(
          { graphic: [{ id: ACTIVE_LINE_MARKER_ID, $action: 'remove' }] },
          { silent: true },
        );
        renderedKey = undefined;
      }
      return;
    }

    // Find this point's value in the selected series and data row.
    const series = dataset.series[activePoint.seriesIndex];
    const value = dataset.source[activePoint.dataIndex]?.[series.key];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      activePoint = undefined;
      render();
      return;
    }

    // Convert the data coordinates to pixels so the marker stays aligned
    // with its point.
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
    // Avoid updating ECharts when the marker is already in the right place.
    if (key === renderedKey) {
      return;
    }

    // Add or replace the marker graphic at the point's pixel position.
    chart.setOption(
      {
        graphic: [
          {
            id: ACTIVE_LINE_MARKER_ID,
            ...getLineSymbol(activePoint.seriesIndex),
            $action: 'replace',
            x: x - SYMBOL_CENTER * ACTIVE_MARKER_SCALE,
            y: y - SYMBOL_CENTER * ACTIVE_MARKER_SCALE,
            scaleX: ACTIVE_MARKER_SCALE,
            scaleY: ACTIVE_MARKER_SCALE,
            style: {
              fill: color,
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
    frame ??= requestAnimationFrame(render);
  };

  const clear = () => {
    activePoint = undefined;
    schedule();
  };

  // Called when the tooltip's active point changes. Keep only points with a
  // valid numeric value, then update the marker after tooltip rendering ends.
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

  // Expose schedule function as reposition for external use which is a more semantically meaningful name
  return { update, clear, reposition: schedule, dispose };
}
