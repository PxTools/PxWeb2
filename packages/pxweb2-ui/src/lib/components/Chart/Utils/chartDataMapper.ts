import { getPxTableData } from '../../Table/Utils/cubeHelper';
import type { PxTable } from '../../../shared-types/pxTable';
import type { DataCell } from '../../../shared-types/pxTableData';

import type {
  EChartsDataset,
  PopulationPyramidConfig,
  PopulationPyramidMappingResult,
  PopulationPyramidValidationResult,
} from './chartTypes';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';

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

type SelectionEntry = string | { code: string };

interface VariableWithOptionalSelection {
  readonly selectedValues?: unknown;
  readonly selection?: unknown;
}

interface ValueWithOptionalSelectedFlag {
  readonly code: string;
  readonly selected?: boolean;
}

function isCodeObject(entry: unknown): entry is { code: string } {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'code' in entry &&
    typeof entry.code === 'string'
  );
}

function selectionEntriesToCodes(entries: SelectionEntry[]): string[] {
  return entries
    .map((entry) => (typeof entry === 'string' ? entry : entry.code))
    .filter((code) => code.length > 0);
}

function selectedFromEntries(
  values: Array<{ code: string; label: string }>,
  entries: unknown,
): Array<{ code: string; label: string }> {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }

  const normalizedEntries = entries.filter(
    (entry): entry is SelectionEntry =>
      typeof entry === 'string' || isCodeObject(entry),
  );

  if (normalizedEntries.length === 0) {
    return [];
  }

  const selectedCodes = new Set(selectionEntriesToCodes(normalizedEntries));
  return values.filter((value) => selectedCodes.has(value.code));
}

function resolveSelectedValues(
  variable: PxTable['metadata']['variables'][number],
) {
  const variableWithOptionalSelection =
    variable as unknown as VariableWithOptionalSelection;

  const selectedFromSelectedValues = selectedFromEntries(
    variable.values,
    variableWithOptionalSelection.selectedValues,
  );
  if (selectedFromSelectedValues.length > 0) {
    return selectedFromSelectedValues;
  }

  const selectedFromSelection = selectedFromEntries(
    variable.values,
    variableWithOptionalSelection.selection,
  );
  if (selectedFromSelection.length > 0) {
    return selectedFromSelection;
  }

  const selectedByFlag = variable.values.filter(
    (value) =>
      (value as unknown as ValueWithOptionalSelectedFlag).selected === true,
  );
  if (selectedByFlag.length > 0) {
    return selectedByFlag;
  }

  return variable.values;
}

export function mapPxTableToChartDataset(pxtable: PxTable): EChartsDataset {
  const rowCombinations = buildCombinations(pxtable.stub);
  const seriesCombinations = buildCombinations(pxtable.heading);

  const title = pxtable.metadata.label;
  const origin = pxtable.metadata.source;
  const unit =
    pxtable.metadata.variables.find(
      (variable) => variable.type === VartypeEnum.CONTENTS_VARIABLE,
    )?.values[0]?.contentInfo?.unit ?? '';
  const series = seriesCombinations.map((combination, index) => ({
    key:
      combination.items.map((item) => item.code).join('|') || `series-${index}`,
    name: getLabel(combination.items, 'Value'),
  }));
  const dimensions = ['name', ...series.map((seriesItem) => seriesItem.key)];

  const source = rowCombinations.map((rowCombination) => {
    const rowMap = toCodeMap(rowCombination.items);
    const row: Record<string, number | string | null> = {
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
        row[seriesKey] = null;
        return;
      }

      const dataCell = getPxTableData<DataCell>(pxtable.data.cube, dimensions);

      row[seriesKey] = dataCell?.value ?? null;
    });

    return row;
  });

  return {
    title,
    origin,
    unit,
    dimensions,
    source,
    series,
  };
}

export function validatePopulationPyramidInput(
  pxtable: PxTable,
): PopulationPyramidValidationResult {
  const variables = [...pxtable.stub, ...pxtable.heading];
  const selectedCountById = new Map(
    variables.map((variable) => [
      variable.id,
      resolveSelectedValues(variable).length,
    ]),
  );

  const twoValueDimensions = variables.filter(
    (variable) => selectedCountById.get(variable.id) === 2,
  );
  if (twoValueDimensions.length === 0) {
    return {
      isValid: false,
      reason: 'MISSING_TWO_VALUE_DIMENSION',
    };
  }
  if (twoValueDimensions.length > 1) {
    return {
      isValid: false,
      reason: 'MULTIPLE_TWO_VALUE_DIMENSIONS',
    };
  }

  const multiValueDimensions = variables.filter(
    (variable) => (selectedCountById.get(variable.id) ?? 0) > 2,
  );
  if (multiValueDimensions.length === 0) {
    return {
      isValid: false,
      reason: 'MISSING_MULTI_VALUE_DIMENSION',
      twoValueDimensionId: twoValueDimensions[0].id,
    };
  }
  if (multiValueDimensions.length > 1) {
    return {
      isValid: false,
      reason: 'MULTIPLE_MULTI_VALUE_DIMENSIONS',
      twoValueDimensionId: twoValueDimensions[0].id,
    };
  }

  const twoValueDimensionId = twoValueDimensions[0].id;
  const multiValueDimensionId = multiValueDimensions[0].id;
  const nonSingleRemainingDimension = variables.find((variable) => {
    if (
      variable.id === twoValueDimensionId ||
      variable.id === multiValueDimensionId
    ) {
      return false;
    }

    return (selectedCountById.get(variable.id) ?? 0) !== 1;
  });

  if (nonSingleRemainingDimension) {
    return {
      isValid: false,
      reason: 'NON_SINGLE_VALUE_REMAINING_DIMENSIONS',
      twoValueDimensionId,
      multiValueDimensionId,
    };
  }

  return {
    isValid: true,
    twoValueDimensionId,
    multiValueDimensionId,
  };
}

function getPopulationPyramidValue(
  pxtable: PxTable,
  codesByVariableId: Record<string, string>,
): number | null {
  const dimensions = pxtable.data.variableOrder.map(
    (variableId) => codesByVariableId[variableId],
  );

  if (dimensions.some((dimension) => !dimension)) {
    return null;
  }

  const dataCell = getPxTableData<DataCell>(pxtable.data.cube, dimensions);
  return dataCell?.value ?? null;
}

export function mapPxTableToPopulationPyramid(
  pxtable: PxTable,
): PopulationPyramidMappingResult {
  const validation = validatePopulationPyramidInput(pxtable);
  if (!validation.isValid) {
    return { validation };
  }

  const variables = [...pxtable.stub, ...pxtable.heading];
  const variableById = new Map(
    variables.map((variable) => [variable.id, variable]),
  );
  const twoValueVariable = validation.twoValueDimensionId
    ? variableById.get(validation.twoValueDimensionId)
    : undefined;
  const multiValueVariable = validation.multiValueDimensionId
    ? variableById.get(validation.multiValueDimensionId)
    : undefined;

  if (!twoValueVariable || !multiValueVariable) {
    return {
      validation: {
        isValid: false,
        reason: 'MISSING_TWO_VALUE_DIMENSION',
      },
    };
  }

  const twoValueDimensionValues = resolveSelectedValues(twoValueVariable);
  const multiValueDimensionValues = resolveSelectedValues(multiValueVariable);

  if (twoValueDimensionValues.length !== 2) {
    return {
      validation: {
        isValid: false,
        reason: 'MISSING_TWO_VALUE_DIMENSION',
      },
    };
  }

  if (multiValueDimensionValues.length < 3) {
    return {
      validation: {
        isValid: false,
        reason: 'MISSING_MULTI_VALUE_DIMENSION',
      },
    };
  }

  const fixedSelectionCodes = Object.fromEntries(
    variables
      .filter(
        (variable) =>
          variable.id !== twoValueVariable.id &&
          variable.id !== multiValueVariable.id,
      )
      .map((variable) => {
        const selectedValues = resolveSelectedValues(variable);
        return [variable.id, selectedValues[0]?.code];
      })
      .filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
  );

  const leftValue = twoValueDimensionValues[0];
  const rightValue = twoValueDimensionValues[1];

  const data: PopulationPyramidConfig['data'] = multiValueDimensionValues.map(
    (categoryValue) => {
      const sharedCodes = {
        ...fixedSelectionCodes,
        [multiValueVariable.id]: categoryValue.code,
      };

      return {
        name: categoryValue.label,
        left: getPopulationPyramidValue(pxtable, {
          ...sharedCodes,
          [twoValueVariable.id]: leftValue.code,
        }),
        right: getPopulationPyramidValue(pxtable, {
          ...sharedCodes,
          [twoValueVariable.id]: rightValue.code,
        }),
      };
    },
  );

  return {
    validation,
    config: {
      title: pxtable.metadata.label,
      origin: pxtable.metadata.source,
      data,
      leftSeriesName: leftValue.label,
      rightSeriesName: rightValue.label,
    },
  };
}
