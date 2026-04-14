import type { PxTable } from '../../shared-types/pxTable';
import { BarChart } from './Charts/BarChart';
import { LineChart } from './Charts/LineChart';
import { useMemo } from 'react';
import { mapPxTableToChart } from './chartDataMapper';

interface ChartProps {
  readonly pxtable: PxTable;
}

export function ChartPx({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);
  return (
    <>
      <BarChart chartConfig={chartConfig} />
      <BarChart chartConfig={chartConfig} isHorizontal={true} />
      <LineChart chartConfig={chartConfig} />
      <span>{pxtable.metadata.label}</span>
    </>
  );
}

export default ChartPx;
