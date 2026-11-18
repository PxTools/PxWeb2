import {
  CartesianChart,
  type ChartProps,
} from '../CartesianChart/CartesianChart';
import { getBarTooltipSymbolSvg } from '../Utils/chartSymbols';

export {
  LegendToggleButton,
  type ChartInstance,
  type ChartProps as BarChartProps,
} from '../CartesianChart/CartesianChart';

export function BarChart(props: ChartProps) {
  return (
    <CartesianChart
      {...props}
      seriesType="bar"
      getTooltipSymbolSvg={getBarTooltipSymbolSvg}
    />
  );
}
