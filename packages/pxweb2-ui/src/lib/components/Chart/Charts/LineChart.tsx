import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function LineChart(data: any) {
  const { data: chartData } = data;

  return (
    <RechartsLineChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      data={chartData}
    >
      <CartesianGrid stroke="#aaa" strokeDasharray="5 5" />
      <Line
        type="monotone"
        dataKey="uv"
        stroke="purple"
        strokeWidth={2}
        name="My data series name"
      />
      <Line
        type="monotone"
        dataKey="pv"
        stroke="blue"
        strokeWidth={2}
        name="Another data series"
      />
      <XAxis dataKey="name" />
      <YAxis
        width="auto"
        label={{ value: 'UV', position: 'insideLeft', angle: -90 }}
      />
      <Legend align="right" />
      <Tooltip />
    </RechartsLineChart>
  );
}
