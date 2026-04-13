import { LineChart } from './Charts/LineChart';
import { BarChart } from './Charts/BarChart';

// #region Sample data
const data = [
  {
    name: 'Page A',
    uv: 400,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 300,
    pv: 4567,
    amt: 2400,
  },
  {
    name: 'Page C',
    uv: 320,
    pv: 1398,
    amt: 2400,
  },
  {
    name: 'Page D',
    uv: 200,
    pv: 9800,
    amt: 2400,
  },
  {
    name: 'Page E',
    uv: 278,
    pv: 3908,
    amt: 2400,
  },
  {
    name: 'Page F',
    uv: 189,
    pv: 4800,
    amt: 2400,
  },
];

export function Chart() {
  return (
    <div>
      <h2>Line Chart Example</h2>
      <LineChart data={data} />
      <h2>Bar Chart Horizontal Example</h2>
      <BarChart data={data} isHorizontal={true} />
      <h2>Bar Chart Vertical Example</h2>
      <BarChart data={data} />
    </div>
  );
}
