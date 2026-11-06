import {
  CartesianChart,
  type ChartProps,
} from '../CartesianChart/CartesianChart';

export {
  LegendToggleButton,
  type ChartInstance,
} from '../CartesianChart/CartesianChart';

export interface BarChartProps extends ChartProps {
  readonly orientation?: 'vertical' | 'horizontal';
}

function getTooltipSymbolSvg(color: string): string {
  return `<svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><rect x="1" y="1" width="8" height="8" rx="2" fill="${color}" /></svg>`;
}

export function BarChart({ orientation = 'vertical', ...props }: BarChartProps) {
  return (
    <CartesianChart
      {...props}
      seriesType="bar"
      orientation={orientation}
      getTooltipSymbolSvg={getTooltipSymbolSvg}
    />
  );
}
