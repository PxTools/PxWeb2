import type { PxTable } from '../../shared-types/pxTable';
import { useMemo } from 'react';
import { mapPxTableToChart } from './chartDataMapper';
import { PopulationPyramid } from './Charts/PopulationPyramid';
import { mapPxTableToPopulationPyramid } from './populationPyramidMapper';
import { RegularCharts } from './Charts/RegularCharts';

interface ChartProps {
  readonly pxtable: PxTable;
}

export function ChartPx({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);
  const populationPyramid = useMemo(
    () => mapPxTableToPopulationPyramid(pxtable),
    [pxtable],
  );

  return (
    <>
      <RegularCharts chartConfig={chartConfig} />
      <PopulationPyramid
        config={populationPyramid.config}
        validation={populationPyramid.validation}
      />
    </>
  );
}

export default ChartPx;
