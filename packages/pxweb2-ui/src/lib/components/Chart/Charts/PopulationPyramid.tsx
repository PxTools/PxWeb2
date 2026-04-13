import { useMemo } from 'react';
import { Bar, BarChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';

import type { PxTable } from '../../../shared-types/pxTable';
import {
  mapPopulationPyramidData,
  validatePopulationPyramidData,
} from '../populationPyramidData';

interface PopulationPyramidProps {
  readonly pxtable: PxTable;
}

function formatAbsolute(value: number | string | null): string {
  if (typeof value !== 'number') {
    return '-';
  }

  return Math.abs(value).toString();
}

export function PopulationPyramid({ pxtable }: PopulationPyramidProps) {
  const validation = useMemo(
    () => validatePopulationPyramidData(pxtable),
    [pxtable],
  );
  const chartConfig = useMemo(
    () => mapPopulationPyramidData(pxtable),
    [pxtable],
  );

  if (!validation.isValid || !chartConfig) {
    return (
      <div>
        <strong>Population pyramid is not available for this dataset.</strong>
        <div>{validation.reason}</div>
      </div>
    );
  }

  return (
    <BarChart
      style={{ width: '100%', aspectRatio: 1.618, maxWidth: 600 }}
      responsive
      data={chartConfig.data}
      layout="vertical"
      stackOffset="sign"
      barCategoryGap={1}
    >
      <XAxis type="number" tickFormatter={(value) => formatAbsolute(value)} />
      <YAxis dataKey="name" type="category" width="auto" />
      <Tooltip
        formatter={(value) => formatAbsolute(value as number | string | null)}
      />
      <Legend />
      <Bar
        stackId="name"
        dataKey="left"
        name={chartConfig.leftSeriesName}
        fill="#5f3dc4"
      />
      <Bar
        stackId="name"
        dataKey="right"
        name={chartConfig.rightSeriesName}
        fill="#1864ab"
      />
    </BarChart>
  );
}
