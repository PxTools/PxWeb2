import { useMemo } from 'react';
import type * as echarts from 'echarts';

import {
  buildDatasetOption,
  buildSeriesOption,
  LINE_SERIES_SYMBOLS,
} from '../Utils/chartOptionBuilder';
import { useEChartOption } from '../Utils/useEChartOption';
import type { PxTable } from '../../../shared-types/pxTable';
import { mapPxTableToChartDataset } from '../Utils/chartDataMapper';
import { getChartColorsFromCssVariables } from '../Utils/chartHelper';

interface LineChartProps {
  readonly pxtable: PxTable;
  readonly colors?: string[];
}

type TooltipParam = {
  axisValueLabel?: string;
  seriesIndex: number;
  seriesName: string;
  data?: Record<string, string | number>;
  color?: string;
};

function getTooltipSymbolSvg(symbol: string, color: string): string {
  switch (symbol) {
    case 'rect':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" fill="${color}" /></svg>`;
    case 'triangle':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><polygon points="5,1 9,9 1,9" fill="${color}" /></svg>`;
    case 'diamond':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><polygon points="5,1 9,5 5,9 1,5" fill="${color}" /></svg>`;
    case 'pin':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 1a2.2 2.2 0 0 0-2.2 2.2c0 1.8 2.2 5.6 2.2 5.6s2.2-3.8 2.2-5.6A2.2 2.2 0 0 0 5 1z" fill="${color}" /></svg>`;
    case 'arrow':
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 5h5V3l3 2-3 2V5H1z" fill="${color}" /></svg>`;
    default:
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="${color}" /></svg>`;
  }
}

export function LineChart({ pxtable, colors }: LineChartProps) {
  const dataset = useMemo(() => mapPxTableToChartDataset(pxtable), [pxtable]);

  const resolvedColors = useMemo(() => {
    return colors && colors.length > 0
      ? colors
      : getChartColorsFromCssVariables();
  }, [colors]);

  const option = useMemo<echarts.EChartsOption>(
    () => ({
      ...buildDatasetOption(dataset),
      grid: { top: 0, bottom: 200, left: '0', right: '0', containLabel: false },
      xAxis: { type: 'category' as const, axisLabel: { rotate: 45 } },
      yAxis: {
        name: dataset.unit,
        min: (value) => value.min,
      },
      legend: {
        height: 40 * dataset.series.length, // increase legend height based on number of series to prevent overlap with x-axis labels
      },
      series: buildSeriesOption(dataset, 'line', resolvedColors),
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          const axisParams = (Array.isArray(params) ? params : [params]) as
            | TooltipParam[]
            | undefined;

          if (!axisParams || axisParams.length === 0) {
            return '';
          }

          const title = axisParams[0].axisValueLabel;
          const rows = axisParams
            .map((param) => {
              const seriesMeta = dataset.series[param.seriesIndex];
              const row = param.data as Record<string, string | number>;
              const value = row?.[seriesMeta.key];
              const symbol =
                LINE_SERIES_SYMBOLS[
                  param.seriesIndex % LINE_SERIES_SYMBOLS.length
                ];
              const color = param.color ?? '#666666';

              return `<div style="display:flex;align-items:center;gap:6px"><span style="display:inline-flex;align-items:center">${getTooltipSymbolSvg(symbol, color)}</span><span>${param.seriesName}: ${value ?? ''}</span></div>`;
            })
            .join('');

          return `<div><div>${title}</div>${rows}</div>`;
        },
      },
    }),
    [dataset, resolvedColors],
  );

  const { divRef } = useEChartOption(option);
  const height = 600 + dataset.series.length * 10; // increase chart height based on number of series to prevent legend overlap

  return (
    <div>
      <div ref={divRef} style={{ width: '100%', height: `${height}px` }}></div>
    </div>
  );
}
export default LineChart;
