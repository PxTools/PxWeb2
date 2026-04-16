import type { PxTable } from '../../shared-types/pxTable';
import type { PopulationPyramidValidationResult } from './chartTypes';

export function validatePopulationPyramidData(
  pxtable: PxTable,
): PopulationPyramidValidationResult {
  const dimensions = pxtable.metadata.variables;

  const twoValueDimensions = dimensions.filter(
    (dimension) => dimension.values.length === 2,
  );
  const multiValueDimensions = dimensions.filter(
    (dimension) => dimension.values.length > 2,
  );

  if (twoValueDimensions.length === 0) {
    return {
      isValid: false,
      reason: 'MISSING_TWO_VALUE_DIMENSION',
      multiValueDimensionId: multiValueDimensions[0]?.id,
    };
  }

  if (twoValueDimensions.length > 1) {
    return {
      isValid: false,
      reason: 'MULTIPLE_TWO_VALUE_DIMENSIONS',
      twoValueDimensionId: twoValueDimensions[0]?.id,
      multiValueDimensionId: multiValueDimensions[0]?.id,
    };
  }

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
      multiValueDimensionId: multiValueDimensions[0]?.id,
    };
  }

  const twoValueDimension = twoValueDimensions[0];
  const multiValueDimension = multiValueDimensions[0];
  const invalidRemainingDimensions = dimensions.filter(
    (dimension) =>
      dimension.id !== twoValueDimension.id &&
      dimension.id !== multiValueDimension.id &&
      dimension.values.length !== 1,
  );

  if (invalidRemainingDimensions.length > 0) {
    return {
      isValid: false,
      reason: 'NON_SINGLE_VALUE_REMAINING_DIMENSIONS',
      twoValueDimensionId: twoValueDimension.id,
      multiValueDimensionId: multiValueDimension.id,
    };
  }

  return {
    isValid: true,
    twoValueDimensionId: twoValueDimension.id,
    multiValueDimensionId: multiValueDimension.id,
  };
}
