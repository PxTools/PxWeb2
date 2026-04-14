import type { ChartConfig } from '../chartTypes';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';

interface RegularChartsProps {
  readonly chartConfig: ChartConfig;
}

export function RegularCharts({ chartConfig }: RegularChartsProps) {
  return (
    <>
      <BarChart chartConfig={chartConfig} />
      <BarChart chartConfig={chartConfig} isHorizontal={true} />
      <LineChart chartConfig={chartConfig} />
    </>
  );
}

export default RegularCharts;
