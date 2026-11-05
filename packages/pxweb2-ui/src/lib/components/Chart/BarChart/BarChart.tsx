import {
  CartesianChart,
  type ChartProps,
} from '../CartesianChart/CartesianChart';

export {
  LegendToggleButton,
  type ChartInstance,
  type ChartProps as BarChartProps,
} from '../CartesianChart/CartesianChart';

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
