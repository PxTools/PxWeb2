import { CartesianChart } from '../CartesianChart';
import type { ChartProps } from '../CartesianChart';

export type { ChartInstance } from '../CartesianChart';
export { LegendToggleButton } from '../CartesianChart';
export type { ChartProps as BarChartProps } from '../CartesianChart';

export function BarChart(props: ChartProps) {
  return <CartesianChart {...props} seriesType="bar" />;
}
