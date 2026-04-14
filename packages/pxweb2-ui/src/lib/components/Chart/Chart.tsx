import type { PxTable } from '../../shared-types/pxTable';

interface ChartProps {
  readonly pxtable: PxTable;
}

export function Chart({ pxtable }: ChartProps) {

  return <h1>Chart</h1>;
  <span>{pxtable.metadata.label}</span>
};

export default Chart;
