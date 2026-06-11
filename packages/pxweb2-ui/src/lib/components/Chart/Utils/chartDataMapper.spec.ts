import { describe, expect, it } from 'vitest';

import {
  mapPxTableToChartDataset,
  mapPxTableToPopulationPyramid,
  validatePopulationPyramidInput,
} from './chartDataMapper';
import { setPxTableData } from '../../Table/Utils/cubeHelper';
import type { PxTable } from '../../../shared-types/pxTable';
import type { Variable } from '../../../shared-types/variable';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import type { DataCell, PxData } from '../../../shared-types/pxTableData';

function createVariable(
  id: string,
  type: VartypeEnum,
  values: Array<{ code: string; label: string }>,
): Variable {
  return {
    id,
    label: id,
    type,
    mandatory: true,
    values,
  };
}

function withSelectedValues(variable: Variable, codes: string[]): Variable {
  return {
    ...(variable as object),
    selectedValues: codes,
  } as unknown as Variable;
}

function createPxTable(
  stub: Variable[],
  heading: Variable[],
  variableOrder: string[],
  cube: PxData<DataCell>,
  metadataVariables?: Variable[],
): PxTable {
  const variables = metadataVariables ?? [...stub, ...heading];

  return {
    metadata: {
      id: 'table-id',
      language: 'en',
      availableLanguages: ['en'],
      label: 'Population by age and sex',
      updated: new Date('2024-01-01'),
      source: 'Demo source',
      infofile: '',
      decimals: 0,
      officialStatistics: true,
      aggregationAllowed: true,
      contents: 'Population',
      descriptionDefault: true,
      matrix: 'M1',
      subjectCode: 'BE',
      subjectArea: 'Population',
      variables,
      contacts: [],
      definitions: {},
      notes: [],
    },
    stub,
    heading,
    data: {
      cube,
      variableOrder,
      isLoaded: true,
    },
  };
}

describe('mapPxTableToChartDataset', () => {
  it('maps a PxTable to chart dataset with expected dimensions and source', () => {
    const year = createVariable('year', VartypeEnum.TIME_VARIABLE, [
      { code: '2023', label: '2023' },
      { code: '2024', label: '2024' },
    ]);
    const sex = createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
      { code: 'M', label: 'Men' },
      { code: 'F', label: 'Women' },
    ]);
    const contents = createVariable('contents', VartypeEnum.CONTENTS_VARIABLE, [
      { code: 'POP', label: 'Population' },
    ]);

    contents.values[0] = {
      ...contents.values[0],
      contentInfo: {
        unit: 'persons',
        decimals: 0,
        referencePeriod: '',
        basePeriod: '',
        alternativeText: '',
      },
    };

    const cube: PxData<DataCell> = {};
    setPxTableData(cube, ['2023', 'M'], { value: 10 });
    setPxTableData(cube, ['2023', 'F'], { value: 11 });
    setPxTableData(cube, ['2024', 'M'], { value: 12 });
    setPxTableData(cube, ['2024', 'F'], { value: 13 });

    const table = createPxTable([year], [sex], ['year', 'sex'], cube, [
      year,
      sex,
      contents,
    ]);

    const result = mapPxTableToChartDataset(table);

    expect(result.title).toBe('Population by age and sex');
    expect(result.origin).toBe('Demo source');
    expect(result.unit).toBe('persons');
    expect(result.series).toEqual([
      { key: 'M', name: 'Men' },
      { key: 'F', name: 'Women' },
    ]);
    expect(result.dimensions).toEqual(['name', 'M', 'F']);
    expect(result.source).toEqual([
      { name: '2023', M: 10, F: 11 },
      { name: '2024', M: 12, F: 13 },
    ]);
  });

  it('returns null cell values when cube values are missing', () => {
    const year = createVariable('year', VartypeEnum.TIME_VARIABLE, [
      { code: '2023', label: '2023' },
    ]);
    const sex = createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
      { code: 'M', label: 'Men' },
      { code: 'F', label: 'Women' },
    ]);

    const cube: PxData<DataCell> = {};
    setPxTableData(cube, ['2023', 'M'], { value: 10 });

    const table = createPxTable([year], [sex], ['year', 'sex'], cube);

    const result = mapPxTableToChartDataset(table);

    expect(result.source).toEqual([{ name: '2023', M: 10, F: null }]);
  });
});

describe('validatePopulationPyramidInput', () => {
  it('returns invalid when no two-value dimension exists', () => {
    const age = withSelectedValues(
      createVariable('age', VartypeEnum.TIME_VARIABLE, [
        { code: '0-4', label: '0-4' },
        { code: '5-9', label: '5-9' },
        { code: '10-14', label: '10-14' },
      ]),
      ['0-4', '5-9', '10-14'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, [
        { code: 'R1', label: 'R1' },
      ]),
      ['R1'],
    );

    const table = createPxTable([age], [region], ['age', 'region'], {});

    expect(validatePopulationPyramidInput(table)).toEqual({
      isValid: false,
      reason: 'MISSING_TWO_VALUE_DIMENSION',
    });
  });

  it('returns invalid when multiple two-value dimensions exist', () => {
    const sex = withSelectedValues(
      createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
        { code: 'M', label: 'Men' },
        { code: 'F', label: 'Women' },
      ]),
      ['M', 'F'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, [
        { code: 'R1', label: 'R1' },
        { code: 'R2', label: 'R2' },
      ]),
      ['R1', 'R2'],
    );

    const table = createPxTable([sex], [region], ['sex', 'region'], {});

    expect(validatePopulationPyramidInput(table)).toEqual({
      isValid: false,
      reason: 'MULTIPLE_TWO_VALUE_DIMENSIONS',
    });
  });

  it('returns invalid when two-value dimension exists but no multi-value dimension exists', () => {
    const sex = withSelectedValues(
      createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
        { code: 'M', label: 'Men' },
        { code: 'F', label: 'Women' },
      ]),
      ['M', 'F'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, [
        { code: 'R1', label: 'R1' },
      ]),
      ['R1'],
    );

    const table = createPxTable([sex], [region], ['sex', 'region'], {});

    expect(validatePopulationPyramidInput(table)).toEqual({
      isValid: false,
      reason: 'MISSING_MULTI_VALUE_DIMENSION',
      twoValueDimensionId: 'sex',
    });
  });

  it('returns invalid when multiple multi-value dimensions exist', () => {
    const sex = withSelectedValues(
      createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
        { code: 'M', label: 'Men' },
        { code: 'F', label: 'Women' },
      ]),
      ['M', 'F'],
    );
    const age = withSelectedValues(
      createVariable('age', VartypeEnum.TIME_VARIABLE, [
        { code: '0-4', label: '0-4' },
        { code: '5-9', label: '5-9' },
        { code: '10-14', label: '10-14' },
      ]),
      ['0-4', '5-9', '10-14'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, [
        { code: 'R1', label: 'R1' },
        { code: 'R2', label: 'R2' },
        { code: 'R3', label: 'R3' },
      ]),
      ['R1', 'R2', 'R3'],
    );

    const table = createPxTable(
      [age],
      [sex, region],
      ['age', 'sex', 'region'],
      {},
    );

    expect(validatePopulationPyramidInput(table)).toEqual({
      isValid: false,
      reason: 'MULTIPLE_MULTI_VALUE_DIMENSIONS',
      twoValueDimensionId: 'sex',
    });
  });

  it('returns invalid when remaining dimensions are not single-selected', () => {
    const sex = withSelectedValues(
      createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
        { code: 'M', label: 'Men' },
        { code: 'F', label: 'Women' },
      ]),
      ['M', 'F'],
    );
    const age = withSelectedValues(
      createVariable('age', VartypeEnum.TIME_VARIABLE, [
        { code: '0-4', label: '0-4' },
        { code: '5-9', label: '5-9' },
        { code: '10-14', label: '10-14' },
      ]),
      ['0-4', '5-9', '10-14'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, []),
      [],
    );

    const table = createPxTable(
      [age],
      [sex, region],
      ['age', 'sex', 'region'],
      {},
    );

    expect(validatePopulationPyramidInput(table)).toEqual({
      isValid: false,
      reason: 'NON_SINGLE_VALUE_REMAINING_DIMENSIONS',
      twoValueDimensionId: 'sex',
      multiValueDimensionId: 'age',
    });
  });

  it('returns valid when one two-value and one multi-value dimension exist and the rest are single-selected', () => {
    const sex = withSelectedValues(
      createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
        { code: 'M', label: 'Men' },
        { code: 'F', label: 'Women' },
      ]),
      ['M', 'F'],
    );
    const age = withSelectedValues(
      createVariable('age', VartypeEnum.TIME_VARIABLE, [
        { code: '0-4', label: '0-4' },
        { code: '5-9', label: '5-9' },
        { code: '10-14', label: '10-14' },
      ]),
      ['0-4', '5-9', '10-14'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, [
        { code: 'R1', label: 'R1' },
      ]),
      ['R1'],
    );

    const table = createPxTable(
      [age],
      [sex, region],
      ['age', 'sex', 'region'],
      {},
    );

    expect(validatePopulationPyramidInput(table)).toEqual({
      isValid: true,
      twoValueDimensionId: 'sex',
      multiValueDimensionId: 'age',
    });
  });
});

describe('mapPxTableToPopulationPyramid', () => {
  it('returns validation only when the input is invalid', () => {
    const age = withSelectedValues(
      createVariable('age', VartypeEnum.TIME_VARIABLE, [
        { code: '0-4', label: '0-4' },
        { code: '5-9', label: '5-9' },
      ]),
      ['0-4', '5-9'],
    );
    const table = createPxTable([age], [], ['age'], {});

    expect(mapPxTableToPopulationPyramid(table)).toEqual({
      validation: {
        isValid: false,
        reason: 'MISSING_MULTI_VALUE_DIMENSION',
        twoValueDimensionId: 'age',
      },
    });
  });

  it('maps valid population pyramid input to chart config', () => {
    const sex = withSelectedValues(
      createVariable('sex', VartypeEnum.REGULAR_VARIABLE, [
        { code: 'M', label: 'Men' },
        { code: 'F', label: 'Women' },
      ]),
      ['M', 'F'],
    );
    const age = withSelectedValues(
      createVariable('age', VartypeEnum.TIME_VARIABLE, [
        { code: '0-4', label: '0-4 years' },
        { code: '5-9', label: '5-9 years' },
        { code: '10-14', label: '10-14 years' },
      ]),
      ['0-4', '5-9', '10-14'],
    );
    const region = withSelectedValues(
      createVariable('region', VartypeEnum.GEOGRAPHICAL_VARIABLE, [
        { code: 'R1', label: 'Region 1' },
      ]),
      ['R1'],
    );

    const cube: PxData<DataCell> = {};
    setPxTableData(cube, ['0-4', 'M', 'R1'], { value: 101 });
    setPxTableData(cube, ['0-4', 'F', 'R1'], { value: 111 });
    setPxTableData(cube, ['5-9', 'M', 'R1'], { value: 102 });
    setPxTableData(cube, ['5-9', 'F', 'R1'], { value: 112 });
    setPxTableData(cube, ['10-14', 'M', 'R1'], { value: 103 });
    // Intentionally omit one cell to verify null handling.

    const table = createPxTable(
      [age],
      [sex, region],
      ['age', 'sex', 'region'],
      cube,
    );

    const result = mapPxTableToPopulationPyramid(table);

    expect(result.validation).toEqual({
      isValid: true,
      twoValueDimensionId: 'sex',
      multiValueDimensionId: 'age',
    });
    expect(result.config).toEqual({
      title: 'Population by age and sex',
      origin: 'Demo source',
      leftSeriesName: 'Men',
      rightSeriesName: 'Women',
      data: [
        { name: '0-4 years', left: 101, right: 111 },
        { name: '5-9 years', left: 102, right: 112 },
        { name: '10-14 years', left: 103, right: null },
      ],
    });
  });
});
