import {
  CartesianChart,
  type ChartProps,
} from '../CartesianChart/CartesianChart';
import { getBarTooltipSymbolSvg } from '../Utils/chartSymbols';

export {
  LegendToggleButton,
  type ChartInstance,
} from '../CartesianChart/CartesianChart';

export interface BarChartProps extends ChartProps {
  readonly orientation?: 'vertical' | 'horizontal';
}

export function BarChart({
  orientation = 'vertical',
  ...props
}: BarChartProps) {
  return (
    <CartesianChart
      {...props}
      seriesType="bar"
      orientation={orientation}
      getTooltipSymbolSvg={getBarTooltipSymbolSvg}
    />
  );
}
