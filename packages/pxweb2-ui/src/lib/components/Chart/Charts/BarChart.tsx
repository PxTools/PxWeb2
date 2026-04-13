import {
  CartesianGrid,
  Legend,
  Bar,
  BarChart as RechartsBarChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function BarChart(data: any) {
  const { data: chartData } = data;

  return (
    <RechartsBarChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      data={chartData}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis width="auto" />
      <Tooltip />
      <Legend />
      <Bar
        dataKey="pv"
        fill="#8884d8"
        activeBar={{ fill: 'pink', stroke: 'blue' }}
        radius={[10, 10, 0, 0]}
      />
      <Bar
        dataKey="uv"
        fill="#82ca9d"
        activeBar={{ fill: 'gold', stroke: 'purple' }}
        radius={[10, 10, 0, 0]}
      />
    </RechartsBarChart>
  );
}
