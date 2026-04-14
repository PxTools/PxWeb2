import type { PxTable } from '../../shared-types/pxTable';
import type { Variable } from '../../shared-types/variable';
import { mapPxTableToPopulationPyramid } from './populationPyramidMapper';
import { validatePopulationPyramidData } from './populationPyramidValidator';

function createVariable(id: string, valueCount: number): Variable {
  return {
    id,
    label: id,
    type: 'd' as never,
    mandatory: true,
    values: Array.from({ length: valueCount }, (_, index) => ({
      code: `${id}-${index}`,
      label: `${id}-${index}`,
    })),
  };
}

function createPxTable(variables: Variable[]): PxTable {
  return {
    metadata: {
      variables,
    },
    data: {
      cube: {
        'sex-0': {
          'age-0': {
            'region-0': { value: 11 },
          },
          'age-1': {
            'region-0': { value: 12 },
          },
          'age-2': {
            'region-0': { value: 13 },
          },
        },
        'sex-1': {
          'age-0': {
            'region-0': { value: 21 },
          },
          'age-1': {
            'region-0': { value: 22 },
          },
          'age-2': {
            'region-0': { value: 23 },
          },
        },
      },
      variableOrder: ['sex', 'age', 'region'],
      isLoaded: true,
    },
    stub: [],
    heading: [],
  } as unknown as PxTable;
}

describe('validatePopulationPyramidData', () => {
  it('validates when there is exactly one 2-value dimension, one multi-value dimension, and remaining single-value dimensions', () => {
    const table = createPxTable([
      createVariable('sex', 2),
      createVariable('age', 3),
      createVariable('region', 1),
    ]);

    const result = validatePopulationPyramidData(table);

    expect(result).toEqual({
      isValid: true,
      twoValueDimensionId: 'sex',
      multiValueDimensionId: 'age',
    });
  });

  it('fails when no 2-value dimension exists', () => {
    const table = createPxTable([
      createVariable('sex', 3),
      createVariable('age', 3),
      createVariable('region', 1),
    ]);

    const result = validatePopulationPyramidData(table);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('MISSING_TWO_VALUE_DIMENSION');
  });

  it('fails when remaining dimensions are not single-value', () => {
    const table = createPxTable([
      createVariable('sex', 2),
      createVariable('age', 3),
      createVariable('region', 0),
    ]);

    const result = validatePopulationPyramidData(table);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('NON_SINGLE_VALUE_REMAINING_DIMENSIONS');
  });
});

describe('mapPxTableToPopulationPyramid', () => {
  it('maps valid table data to population pyramid config', () => {
    const table = createPxTable([
      createVariable('sex', 2),
      createVariable('age', 3),
      createVariable('region', 1),
    ]);

    const result = mapPxTableToPopulationPyramid(table);

    expect(result.validation.isValid).toBe(true);
    expect(result.config?.leftSeriesName).toBe('sex-0');
    expect(result.config?.rightSeriesName).toBe('sex-1');
    expect(result.config?.data).toEqual([
      { name: 'age-0', left: 11, right: 21 },
      { name: 'age-1', left: 12, right: 22 },
      { name: 'age-2', left: 13, right: 23 },
    ]);
  });
});
