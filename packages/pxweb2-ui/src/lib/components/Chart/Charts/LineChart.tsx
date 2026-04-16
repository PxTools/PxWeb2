import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { ChartDataPoint, ChartSeries } from '../chartTypes';

interface LineChartProps {
  readonly data: ChartDataPoint[];
  readonly series: ChartSeries[];
}

const seriesColors = ['#5f3dc4', '#1864ab', '#0b7285', '#2b8a3e', '#e67700'];

export function LineChart({ data, series }: LineChartProps) {
  const chartSeries =
    series.length > 0 ? series : [{ key: 'value', name: 'Value' }];

  return (
    <RechartsLineChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      data={data}
    >
      <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Legend align="right" />
      <Tooltip />

      {chartSeries.map((serie, index) => (
        <Line
          key={serie.key}
          type="monotone"
          dataKey={serie.key}
          stroke={seriesColors[index % seriesColors.length]}
          strokeWidth={2}
          name={serie.name}
          connectNulls
        />
      ))}
    </RechartsLineChart>
  );
}
