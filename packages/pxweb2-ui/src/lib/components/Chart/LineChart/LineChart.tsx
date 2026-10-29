import { CartesianChart } from '../CartesianChart/CartesianChart';
import type { ChartProps } from '../CartesianChart/CartesianChart';
import { LINE_SERIES_SYMBOLS } from '../Utils/chartOptionBuilder';

export type { ChartInstance } from '../CartesianChart/CartesianChart';
export { LegendToggleButton } from '../CartesianChart/CartesianChart';
export type { ChartProps as LineChartProps } from '../CartesianChart/CartesianChart';

function getTooltipSymbolSvg(color: string, seriesIndex: number): string {
  const symbol = LINE_SERIES_SYMBOLS[seriesIndex % LINE_SERIES_SYMBOLS.length];

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
      return `<svg width="10" height="10" viewBox="0 0 13.33 10" aria-hidden="true"><path d="M6.67 0 13.33 10 6.67 7.5 0 10Z" fill="${color}" /></svg>`;
    default:
      return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="${color}" /></svg>`;
  }
}

export function LineChart(props: ChartProps) {
  return (
    <CartesianChart
      {...props}
      seriesType="line"
      breakValueAxis
      getTooltipSymbolSvg={getTooltipSymbolSvg}
    />
  );
}
