// Duplicate jsonstat2-to-pxtable mapping logic. 
// The original mapper is in the pxweb2 package. SHOULD WE MOVE THIS TO A SHARED PACKAGE?
import type { Dataset, jsonstat_category } from '@pxweb2/pxweb2-api-client';

import type { PxTable } from '../../../../shared-types/pxTable';
import type { PxTableMetadata } from '../../../../shared-types/pxTableMetadata';
import type { Variable } from '../../../../shared-types/variable';
import type { Value } from '../../../../shared-types/value';
import type { DataCell, PxData } from '../../../../shared-types/pxTableData';
import { VartypeEnum } from '../../../../shared-types/vartypeEnum';
import { setPxTableData } from '../../../Table/cubeHelper';

function getOrderedCodes(category?: jsonstat_category): string[] {
  if (!category?.index) {
    return [];
  }

  return Object.entries(category.index)
    .sort((a, b) => a[1] - b[1])
    .map(([code]) => code);
}

function mapValue(
  code: string,
  label: string,
  unit?: { base?: string; decimals?: number },
): Value {
  return {
    code,
    label,
    contentInfo: unit
      ? {
          unit: unit.base ?? '',
          decimals: unit.decimals ?? 0,
          referencePeriod: '',
          basePeriod: '',
          alternativeText: '',
        }
      : undefined,
  };
}

function resolveVariableType(
  variableId: string,
  role: Dataset['role'],
): VartypeEnum {
  if (role?.metric?.includes(variableId)) {
    return VartypeEnum.CONTENTS_VARIABLE;
  }

  if (role?.time?.includes(variableId)) {
    return VartypeEnum.TIME_VARIABLE;
  }

  if (role?.geo?.includes(variableId)) {
    return VartypeEnum.GEOGRAPHICAL_VARIABLE;
  }

  return VartypeEnum.REGULAR_VARIABLE;
}

function mapVariables(dataset: Dataset): Variable[] {
  return dataset.id.map((variableId) => {
    const dimension = dataset.dimension[variableId];
    const category = dimension?.category;
    const labels = category?.label ?? {};
    const units = category?.unit;
    const codes = getOrderedCodes(category);

    return {
      id: variableId,
      label: dimension?.label ?? variableId,
      type: resolveVariableType(variableId, dataset.role),
      mandatory: false,
      values: codes.map((code) => mapValue(code, labels[code] ?? code, units?.[code])),
    };
  });
}

function toMultiDimensionalIndices(
  linearIndex: number,
  dimensions: number[],
): number[] {
  const indices: number[] = [];
  let remaining = linearIndex;

  for (let i = dimensions.length - 1; i >= 0; i--) {
    const dimensionSize = dimensions[i];
    indices.unshift(remaining % dimensionSize);
    remaining = Math.floor(remaining / dimensionSize);
  }

  return indices;
}

function createCubeData(
  dataset: Dataset,
  orderedCodesByVariableId: Record<string, string[]>,
): PxData<DataCell> {
  const cube: PxData<DataCell> = {};
  const values = dataset.value ?? [];

  values.forEach((value, index) => {
    const dimensionIndices = toMultiDimensionalIndices(index, dataset.size);
    const codesByDimension = dataset.id.map(
      (variableId, variableIndex) =>
        orderedCodesByVariableId[variableId][dimensionIndices[variableIndex]],
    );

    const dataCell: DataCell = {
      value,
      status: dataset.status?.[index.toString()],
    };

    setPxTableData(cube, codesByDimension, dataCell);
  });

  return cube;
}

function mapStubAndHeading(
  metadataVariables: Variable[],
  dataset: Dataset,
): Pick<PxTable, 'stub' | 'heading'> {
  const variableById = new Map(
    metadataVariables.map((variable) => [variable.id, variable]),
  );

  const stub = (dataset.extension?.px?.stub ?? [])
    .map((variableId) => variableById.get(variableId))
    .filter((variable): variable is Variable => Boolean(variable));

  const heading = (dataset.extension?.px?.heading ?? [])
    .map((variableId) => variableById.get(variableId))
    .filter((variable): variable is Variable => Boolean(variable));

  if (stub.length === 0 && heading.length === 0) {
    const fallbackStub = metadataVariables[0] ? [metadataVariables[0]] : [];
    const fallbackHeading = metadataVariables.slice(1);

    return {
      stub: fallbackStub,
      heading: fallbackHeading,
    };
  }

  return {
    stub,
    heading,
  };
}

export function mapJsonStat2DatasetToPxTable(dataset: Dataset): PxTable {
  const variables = mapVariables(dataset);
  const orderedCodesByVariableId = Object.fromEntries(
    dataset.id.map((variableId) => {
      const codes = getOrderedCodes(dataset.dimension[variableId]?.category);
      return [variableId, codes];
    }),
  );

  const metadata: PxTableMetadata = {
    id: dataset.extension?.px?.tableid ?? '',
    language: dataset.extension?.px?.language ?? '',
    label: dataset.label ?? '',
    description: dataset.extension?.px?.description,
    updated: dataset.updated ? new Date(dataset.updated) : new Date(),
    source: dataset.source ?? '',
    infofile: dataset.extension?.px?.infofile ?? '',
    decimals: dataset.extension?.px?.decimals ?? 0,
    officialStatistics: dataset.extension?.px?.['official-statistics'] ?? false,
    aggregationAllowed: dataset.extension?.px?.aggregallowed ?? true,
    contents: dataset.extension?.px?.contents ?? '',
    descriptionDefault: dataset.extension?.px?.descriptiondefault ?? false,
    matrix: dataset.extension?.px?.matrix ?? '',
    survey: dataset.extension?.px?.survey,
    updateFrequency: dataset.extension?.px?.updateFrequency,
    link: dataset.extension?.px?.link,
    copyright: dataset.extension?.px?.copyright,
    nextUpdate: dataset.extension?.px?.nextUpdate
      ? new Date(dataset.extension.px.nextUpdate)
      : undefined,
    subjectCode: dataset.extension?.px?.['subject-code'] ?? '',
    subjectArea: dataset.extension?.px?.['subject-area'] ?? '',
    variables,
    contacts: dataset.extension?.contact ?? [],
    definitions: {},
    notes: [],
  };

  const { stub, heading } = mapStubAndHeading(variables, dataset);

  return {
    metadata,
    data: {
      cube: createCubeData(dataset, orderedCodesByVariableId),
      variableOrder: dataset.id,
      isLoaded: true,
    },
    stub,
    heading,
  };
}
