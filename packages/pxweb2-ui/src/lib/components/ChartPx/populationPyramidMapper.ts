import type { PxTable } from '../../shared-types/pxTable';
import type { DataCell } from '../../shared-types/pxTableData';
import { getPxTableData } from '../Table/cubeHelper';
import type { PopulationPyramidMappingResult } from './chartTypes';
import { validatePopulationPyramidData } from './populationPyramidValidator';

function getValueFromCube(
  pxtable: PxTable,
  dimensionCodes: Record<string, string>,
): number | null {
  const dimensions = pxtable.data.variableOrder.map(
    (dimensionId) => dimensionCodes[dimensionId],
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
  const validation = validatePopulationPyramidData(pxtable);

  if (!validation.isValid) {
    return { validation };
  }

  const twoValueDimension = pxtable.metadata.variables.find(
    (dimension) => dimension.id === validation.twoValueDimensionId,
  );
  const multiValueDimension = pxtable.metadata.variables.find(
    (dimension) => dimension.id === validation.multiValueDimensionId,
  );

  if (!twoValueDimension || !multiValueDimension) {
    return {
      validation: {
        ...validation,
        isValid: false,
        reason: 'NON_SINGLE_VALUE_REMAINING_DIMENSIONS',
      },
    };
  }

  const [leftValue, rightValue] = twoValueDimension.values;
  const fixedDimensions = Object.fromEntries(
    pxtable.metadata.variables
      .filter(
        (dimension) =>
          dimension.id !== twoValueDimension.id &&
          dimension.id !== multiValueDimension.id,
      )
      .map((dimension) => [dimension.id, dimension.values[0].code]),
  );

  const data = multiValueDimension.values.map((value) => {
    const leftDimensionCodes = {
      ...fixedDimensions,
      [multiValueDimension.id]: value.code,
      [twoValueDimension.id]: leftValue.code,
    };
    const rightDimensionCodes = {
      ...fixedDimensions,
      [multiValueDimension.id]: value.code,
      [twoValueDimension.id]: rightValue.code,
    };

    return {
      name: value.label,
      left: getValueFromCube(pxtable, leftDimensionCodes),
      right: getValueFromCube(pxtable, rightDimensionCodes),
    };
  });

  return {
    validation,
    config: {
      data,
      leftSeriesName: leftValue.label,
      rightSeriesName: rightValue.label,
    },
  };
}
