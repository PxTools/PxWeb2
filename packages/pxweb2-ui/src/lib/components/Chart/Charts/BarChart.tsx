import {
  CartesianGrid,
  Legend,
  Bar,
  BarChart as RechartsBarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BarChartDataPoint {
  readonly name: string;
  readonly pv: number;
  readonly uv: number;
}

interface BarChartProps {
  readonly data: BarChartDataPoint[] | { readonly data: BarChartDataPoint[] };
  readonly isHorizontal?: boolean;
}
export function BarChart({ data, isHorizontal = false }: BarChartProps) {
  const chartData = Array.isArray(data) ? data : data?.data;

  return (
    <RechartsBarChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      layout={isHorizontal ? 'vertical' : 'horizontal'}
      data={chartData}
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
      <Bar
        dataKey="pv"
        fill="#8884d8"
        activeBar={{ fill: 'pink', stroke: 'blue' }}
      />
      <Bar
        dataKey="uv"
        fill="#82ca9d"
        activeBar={{ fill: 'gold', stroke: 'purple' }}
      />
    </RechartsBarChart>
  );
}
