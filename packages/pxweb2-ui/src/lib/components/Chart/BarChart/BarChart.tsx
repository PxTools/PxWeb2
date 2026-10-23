import { CartesianChart } from '../CartesianChart';
import type { ChartProps } from '../CartesianChart';

export type { ChartInstance } from '../CartesianChart';
export { LegendToggleButton } from '../CartesianChart';
export type { ChartProps as BarChartProps } from '../CartesianChart';

function getTooltipSymbolSvg(color: string): string {
  return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="2" fill="${color}" /></svg>`;
}

export function BarChart(props: ChartProps) {
  return (
    <CartesianChart
      {...props}
      seriesType="bar"
      getTooltipSymbolSvg={getTooltipSymbolSvg}
    />
  );
}
