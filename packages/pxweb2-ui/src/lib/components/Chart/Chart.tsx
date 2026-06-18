import BarChart from './Charts/BarChart';
import LineChart from './Charts/LineChart';
import { PopulationPyramid } from './Charts/PopulationPyramid';
import { useMemo } from 'react';
import LocalAlert from '../LocalAlert/LocalAlert';
import {
  mapChartConfigToEChartsDataset,
  mapPxTableToChart,
  mapPxTableToPopulationPyramid,
} from './chartDataMapper';

import type { PxTable } from '../../shared-types/pxTable';

interface ChartProps {
  readonly pxtable: PxTable;
}
export function Chart({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);
  const dataset = useMemo(
    () => mapChartConfigToEChartsDataset(chartConfig),
    [chartConfig],
  );
  const populationPyramidResult = useMemo(
    () => mapPxTableToPopulationPyramid(pxtable),
    [pxtable],
  );

  const pyramidWarningText = useMemo(() => {
    switch (populationPyramidResult.validation.reason) {
      case 'MISSING_TWO_VALUE_DIMENSION':
        return 'Population pyramid requires exactly one dimension with two selected values.';
      case 'MULTIPLE_TWO_VALUE_DIMENSIONS':
        return 'Population pyramid supports only one two-value dimension.';
      case 'MISSING_MULTI_VALUE_DIMENSION':
        return 'Population pyramid requires one dimension with several selected values.';
      case 'MULTIPLE_MULTI_VALUE_DIMENSIONS':
        return 'Population pyramid supports only one multi-value dimension.';
      case 'NON_SINGLE_VALUE_REMAINING_DIMENSIONS':
        return 'All remaining dimensions must have exactly one selected value for population pyramid.';
      default:
        return '';
    }
  }, [populationPyramidResult.validation.reason]);

  return (
    <>
      <BarChart dataset={dataset} isHorizontal={true}></BarChart>
      <BarChart dataset={dataset}></BarChart>
      <LineChart dataset={dataset}></LineChart>
      {populationPyramidResult.config ? (
        <PopulationPyramid
          dataset={populationPyramidResult.config}
        ></PopulationPyramid>
      ) : (
        <LocalAlert
          variant="warning"
          size="small"
          heading="Population pyramid unavailable"
        >
          {pyramidWarningText}
        </LocalAlert>
      )}
    </>
  );
}
export default Chart;
