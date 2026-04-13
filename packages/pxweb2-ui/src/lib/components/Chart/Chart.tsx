import { useMemo } from 'react';

import { LineChart } from './Charts/LineChart';
import { BarChart } from './Charts/BarChart';
import { getPxTableData } from '../Table/cubeHelper';
import { PxTable } from '../../shared-types/pxTable';
import { DataCell } from '../../shared-types/pxTableData';

export interface ChartDataPoint {
  readonly name: string;
  readonly [seriesKey: string]: number | string | null;
}

export interface ChartSeries {
  readonly key: string;
  readonly name: string;
}

interface CombinationItem {
  readonly variableId: string;
  readonly code: string;
  readonly label: string;
}

interface Combination {
  readonly items: CombinationItem[];
}

interface ChartProps {
  readonly pxtable: PxTable;
}

function buildCombinations(
  variables: PxTable['metadata']['variables'],
): Combination[] {
  if (variables.length === 0) {
    return [{ items: [] }];
  }

  return variables.reduce<Combination[]>(
    (acc, variable) => {
      const next: Combination[] = [];
      const values = variable.values.length > 0 ? variable.values : [];

      for (const combo of acc) {
        for (const value of values) {
          next.push({
            items: [
              ...combo.items,
              {
                variableId: variable.id,
                code: value.code,
                label: value.label,
              },
            ],
          });
        }
      }

      return next;
    },
    [{ items: [] }],
  );
}

function toCodeMap(items: CombinationItem[]): Record<string, string> {
  return Object.fromEntries(items.map((item) => [item.variableId, item.code]));
}

function getLabel(items: CombinationItem[], fallback: string): string {
  if (items.length === 0) {
    return fallback;
  }

  return items.map((item) => item.label).join(' / ');
}

function mapPxTableToChart(pxtable: PxTable): {
  data: ChartDataPoint[];
  series: ChartSeries[];
} {
  const rowCombinations = buildCombinations(pxtable.stub);
  const seriesCombinations = buildCombinations(pxtable.heading);

  const series: ChartSeries[] = seriesCombinations.map(
    (combination, index) => ({
      key:
        combination.items.map((item) => item.code).join('|') ||
        `series-${index}`,
      name: getLabel(combination.items, 'Value'),
    }),
  );

  const data = rowCombinations.map((rowCombination) => {
    const rowMap = toCodeMap(rowCombination.items);
    const point: Record<string, number | string | null> = {
      name: getLabel(rowCombination.items, 'Value'),
    };

    seriesCombinations.forEach((seriesCombination, seriesIndex) => {
      const seriesKey = series[seriesIndex].key;
      const allCodes = {
        ...rowMap,
        ...toCodeMap(seriesCombination.items),
      };

      const dimensions = pxtable.data.variableOrder.map(
        (variableId) => allCodes[variableId],
      );

      if (dimensions.some((dimension) => !dimension)) {
        point[seriesKey] = null;
        return;
      }

      const dataCell = getPxTableData<DataCell>(pxtable.data.cube, dimensions);

      point[seriesKey] = dataCell?.value ?? null;
    });

    return point as ChartDataPoint;
  });

  return { data, series };
}

export function Chart({ pxtable }: ChartProps) {
  const chartConfig = useMemo(() => mapPxTableToChart(pxtable), [pxtable]);

  return (
    <div>
      <h2>Line Chart Example</h2>
      <LineChart data={chartConfig.data} series={chartConfig.series} />
      <h2>Bar Chart Horizontal Example</h2>
      <BarChart
        data={chartConfig.data}
        series={chartConfig.series}
        isHorizontal={true}
      />
      <h2>Bar Chart Vertical Example</h2>
      <BarChart data={chartConfig.data} series={chartConfig.series} />
    </div>
  );
}
