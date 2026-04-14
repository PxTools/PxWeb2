import type { PxTable } from '../../shared-types/pxTable';
import { BarChart } from './Charts/BarChart';
import { LineChart } from './Charts/LineChart';


interface ChartProps {
  readonly pxtable: PxTable;
}

  const data = [
  { year: 2010, count: 10 },
  { year: 2011, count: 20 },
  { year: 2012, count: 15 },
  { year: 2013, count: 25 },
  { year: 2014, count: 22 },
  { year: 2015, count: 30 },
  { year: 2016, count: 28 },
];

export function ChartPx({ pxtable }: ChartProps) {
  return (
    <>
      <BarChart data={data} />
      <BarChart data={data} isHorizontal={true} />
      <LineChart data={data} />
      <span>{pxtable.metadata.label}</span>
    </>
  );
}

export default ChartPx;
