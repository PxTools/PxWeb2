import { CartesianChart } from '../CartesianChart';
import type { ChartProps } from '../CartesianChart';

export type { ChartInstance } from '../CartesianChart';
export { LegendToggleButton } from '../CartesianChart';
export type { ChartProps as LineChartProps } from '../CartesianChart';

export function LineChart(props: ChartProps) {
  return <CartesianChart {...props} seriesType="line" />;
}
