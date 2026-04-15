import { getPxTableData } from '../Table/cubeHelper';
import type { PxTable } from '../../shared-types/pxTable';
import type { DataCell } from '../../shared-types/pxTableData';

import type {
  ChartConfig,
  ChartDataPoint,
  ChartSeries,
  EChartsDataset,
} from './chartTypes';

interface CombinationItem {
  readonly variableId: string;
  readonly code: string;
  readonly label: string;
}

interface Combination {
  readonly items: CombinationItem[];
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

export function mapPxTableToChart(pxtable: PxTable): ChartConfig {
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

export function mapChartConfigToEChartsDataset(
  chartConfig: ChartConfig,
): EChartsDataset {
  const dimensions = [
    'name',
    ...chartConfig.series.map((series) => series.key),
  ];

  const source = chartConfig.data.map((point) => {
    const row: Record<string, string | number | null> = {
      name: point.name,
    };

    for (const series of chartConfig.series) {
      const value = point[series.key];
      row[series.key] =
        typeof value === 'number' || value === null ? value : null;
    }

    return row;
  });

  return {
    dimensions,
    source,
    series: chartConfig.series,
  };
}
