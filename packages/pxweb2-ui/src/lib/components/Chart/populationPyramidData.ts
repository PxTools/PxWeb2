import { getPxTableData } from '../Table/cubeHelper';
import type { PxTable } from '../../shared-types/pxTable';
import type { DataCell } from '../../shared-types/pxTableData';
import type { Variable } from '../../shared-types/variable';

import {
  type PopulationPyramidConfig,
  type PopulationPyramidValidationResult,
} from './chartTypes';

function allDimensions(pxtable: PxTable): Variable[] {
  return [...pxtable.stub, ...pxtable.heading];
}

export function validatePopulationPyramidData(
  pxtable: PxTable,
): PopulationPyramidValidationResult {
  const dimensions = allDimensions(pxtable);

  const twoValueDimensions = dimensions.filter(
    (dimension) => dimension.values.length === 2,
  );
  const multiValueDimensions = dimensions.filter(
    (dimension) => dimension.values.length > 2,
  );

  if (twoValueDimensions.length !== 1) {
    return {
      isValid: false,
      reason:
        'Population pyramid requires exactly one dimension with 2 values.',
    };
  }

  if (multiValueDimensions.length !== 1) {
    return {
      isValid: false,
      reason:
        'Population pyramid requires exactly one dimension with more than 2 values.',
    };
  }

  const twoValueDimension = twoValueDimensions[0];
  const multiValueDimension = multiValueDimensions[0];

  const restDimensions = dimensions.filter(
    (dimension) =>
      dimension.id !== twoValueDimension.id &&
      dimension.id !== multiValueDimension.id,
  );

  if (restDimensions.some((dimension) => dimension.values.length !== 1)) {
    return {
      isValid: false,
      reason:
        'Population pyramid requires all remaining dimensions to have exactly one value.',
    };
  }

  return {
    isValid: true,
    twoValueDimensionId: twoValueDimension.id,
    multiValueDimensionId: multiValueDimension.id,
  };
}

export function mapPopulationPyramidData(
  pxtable: PxTable,
): PopulationPyramidConfig | null {
  const validation = validatePopulationPyramidData(pxtable);

  if (
    !validation.isValid ||
    !validation.twoValueDimensionId ||
    !validation.multiValueDimensionId
  ) {
    return null;
  }

  const dimensions = allDimensions(pxtable);
  const splitDimension = dimensions.find(
    (dimension) => dimension.id === validation.twoValueDimensionId,
  );
  const categoryDimension = dimensions.find(
    (dimension) => dimension.id === validation.multiValueDimensionId,
  );

  if (!splitDimension || !categoryDimension) {
    return null;
  }

  const [leftValue, rightValue] = splitDimension.values;

  const fixedCodes = Object.fromEntries(
    dimensions
      .filter(
        (dimension) =>
          dimension.id !== splitDimension.id &&
          dimension.id !== categoryDimension.id &&
          dimension.values.length === 1,
      )
      .map((dimension) => [dimension.id, dimension.values[0].code]),
  );

  const data = categoryDimension.values.map((categoryValue) => {
    const leftCodes: Record<string, string> = {
      ...fixedCodes,
      [categoryDimension.id]: categoryValue.code,
      [splitDimension.id]: leftValue.code,
    };

    const rightCodes: Record<string, string> = {
      ...fixedCodes,
      [categoryDimension.id]: categoryValue.code,
      [splitDimension.id]: rightValue.code,
    };

    const leftDimensions = pxtable.data.variableOrder.map(
      (variableId) => leftCodes[variableId],
    );
    const rightDimensions = pxtable.data.variableOrder.map(
      (variableId) => rightCodes[variableId],
    );

    const leftCell = leftDimensions.some((dimension) => !dimension)
      ? undefined
      : getPxTableData<DataCell>(pxtable.data.cube, leftDimensions);
    const rightCell = rightDimensions.some((dimension) => !dimension)
      ? undefined
      : getPxTableData<DataCell>(pxtable.data.cube, rightDimensions);

    const leftValueNumber = leftCell?.value;
    const rightValueNumber = rightCell?.value;

    return {
      name: categoryValue.label,
      left:
        typeof leftValueNumber === 'number' ? -Math.abs(leftValueNumber) : null,
      right:
        typeof rightValueNumber === 'number'
          ? Math.abs(rightValueNumber)
          : null,
    };
  });

  return {
    data,
    leftSeriesName: leftValue.label,
    rightSeriesName: rightValue.label,
  };
}
