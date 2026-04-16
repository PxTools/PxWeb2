import {
  CartesianGrid,
  Legend,
  Bar,
  BarChart as RechartsBarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartDataPoint, ChartSeries } from '../chartTypes';

const seriesColors = ['#5f3dc4', '#1864ab', '#0b7285', '#2b8a3e', '#e67700'];

interface BarChartProps {
  readonly data: ChartDataPoint[];
  readonly series: ChartSeries[];
  readonly isHorizontal?: boolean;
}

export function BarChart({
  data,
  series,
  isHorizontal = false,
}: BarChartProps) {
  const chartSeries =
    series.length > 0 ? series : [{ key: 'value', name: 'Value' }];

  return (
    <RechartsBarChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      layout={isHorizontal ? 'vertical' : 'horizontal'}
      data={data}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey={isHorizontal ? undefined : 'name'}
        type={isHorizontal ? 'number' : 'category'}
      />
      <YAxis
        dataKey={isHorizontal ? 'name' : undefined}
        type={isHorizontal ? 'category' : 'number'}
        width="auto"
      />
      <Tooltip />
      <Legend />

      {chartSeries.map((serie, index) => (
        <Bar
          key={serie.key}
          dataKey={serie.key}
          name={serie.name}
          fill={seriesColors[index % seriesColors.length]}
        />
      ))}
    </RechartsBarChart>
  );
}
