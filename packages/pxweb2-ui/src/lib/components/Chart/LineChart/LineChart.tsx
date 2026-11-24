import {
  CartesianChart,
  type ChartProps,
} from '../CartesianChart/CartesianChart';
import { getLineTooltipSymbolSvg } from '../Utils/chartSymbols';

export {
  LegendToggleButton,
  type ChartInstance,
  type ChartProps as LineChartProps,
} from '../CartesianChart/CartesianChart';

export function LineChart(props: ChartProps) {
  return (
    <CartesianChart
      {...props}
      seriesType="line"
      breakValueAxis
      getTooltipSymbolSvg={getLineTooltipSymbolSvg}
    />
  );
}
