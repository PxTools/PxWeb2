import { describe, expect, it } from 'vitest';

import {
  mapChartConfigToEChartsDataset,
  mapPxTableToPopulationPyramid,
  validatePopulationPyramidInput,
} from './chartDataMapper';

import type { ChartConfig } from './chartTypes';
import type { PxTable } from '../../shared-types/pxTable';
import { VartypeEnum } from '../../shared-types/vartypeEnum';

function createPyramidPxTable(overrides?: {
  sexCount?: number;
  ageCount?: number;
  regionCount?: number;
  timeCount?: number;
}): PxTable {
  const sexCount = overrides?.sexCount ?? 2;
  const ageCount = overrides?.ageCount ?? 3;
  const regionCount = overrides?.regionCount ?? 1;
  const timeCount = overrides?.timeCount ?? 1;

  const sexValues = Array.from({ length: sexCount }, (_, index) => ({
    code: `S${index + 1}`,
    label: `Sex ${index + 1}`,
  }));
  const ageValues = Array.from({ length: ageCount }, (_, index) => ({
    code: `A${index + 1}`,
    label: `Age ${index + 1}`,
  }));
  const regionValues = Array.from({ length: regionCount }, (_, index) => ({
    code: `R${index + 1}`,
    label: `Region ${index + 1}`,
  }));
  const timeValues = Array.from({ length: timeCount }, (_, index) => ({
    code: `T${index + 1}`,
    label: `Time ${index + 1}`,
  }));

  const cube: Record<
    string,
    Record<string, Record<string, Record<string, { value: number }>>>
  > = {};
  for (let sexIndex = 0; sexIndex < sexValues.length; sexIndex += 1) {
    const sexCode = sexValues[sexIndex].code;
    cube[sexCode] = {};
    for (let ageIndex = 0; ageIndex < ageValues.length; ageIndex += 1) {
      const ageCode = ageValues[ageIndex].code;
      cube[sexCode][ageCode] = {};
      for (
        let regionIndex = 0;
        regionIndex < regionValues.length;
        regionIndex += 1
      ) {
        const regionCode = regionValues[regionIndex].code;
        cube[sexCode][ageCode][regionCode] = {};
        for (let timeIndex = 0; timeIndex < timeValues.length; timeIndex += 1) {
          const timeCode = timeValues[timeIndex].code;
          cube[sexCode][ageCode][regionCode][timeCode] = {
            value:
              (sexIndex + 1) * 100 +
              (ageIndex + 1) * 10 +
              (regionIndex + 1) +
              timeIndex,
          };
        }
      }
    }
  }

  return {
    metadata: {
      id: 'pyramid-test',
      language: 'en',
      label: 'Population pyramid',
      updated: new Date('2026-01-01'),
      source: '',
      infofile: '',
      decimals: 0,
      officialStatistics: false,
      aggregationAllowed: false,
      contents: '',
      descriptionDefault: false,
      matrix: '',
      subjectCode: '',
      subjectArea: '',
      variables: [
        {
          id: 'sex',
          label: 'Sex',
          type: VartypeEnum.REGULAR_VARIABLE,
          mandatory: false,
          values: sexValues,
        },
        {
          id: 'age',
          label: 'Age',
          type: VartypeEnum.REGULAR_VARIABLE,
          mandatory: false,
          values: ageValues,
        },
        {
          id: 'region',
          label: 'Region',
          type: VartypeEnum.GEOGRAPHICAL_VARIABLE,
          mandatory: false,
          values: regionValues,
        },
        {
          id: 'time',
          label: 'Time',
          type: VartypeEnum.TIME_VARIABLE,
          mandatory: false,
          values: timeValues,
        },
      ],
      contacts: [],
      definitions: {},
      notes: [],
    },
    data: {
      cube,
      variableOrder: ['sex', 'age', 'region', 'time'],
      isLoaded: true,
    },
    heading: [
      {
        id: 'sex',
        label: 'Sex',
        type: VartypeEnum.REGULAR_VARIABLE,
        mandatory: false,
        values: sexValues,
      },
    ],
    stub: [
      {
        id: 'age',
        label: 'Age',
        type: VartypeEnum.REGULAR_VARIABLE,
        mandatory: false,
        values: ageValues,
      },
      {
        id: 'region',
        label: 'Region',
        type: VartypeEnum.GEOGRAPHICAL_VARIABLE,
        mandatory: false,
        values: regionValues,
      },
      {
        id: 'time',
        label: 'Time',
        type: VartypeEnum.TIME_VARIABLE,
        mandatory: false,
        values: timeValues,
      },
    ],
  };
}

describe('mapChartConfigToEChartsDataset', () => {
  it('maps dimensions and values using chart series order', () => {
    const chartConfig: ChartConfig = {
      series: [
        { key: 'year-2024', name: '2024' },
        { key: 'year-2025', name: '2025' },
      ],
      data: [
        { name: 'Product A', 'year-2024': 10, 'year-2025': 20 },
        { name: 'Product B', 'year-2024': 30, 'year-2025': 40 },
      ],
    };

    const dataset = mapChartConfigToEChartsDataset(chartConfig);

    expect(dataset.dimensions).toEqual(['name', 'year-2024', 'year-2025']);
    expect(dataset.series).toEqual(chartConfig.series);
    expect(dataset.source).toEqual([
      { name: 'Product A', 'year-2024': 10, 'year-2025': 20 },
      { name: 'Product B', 'year-2024': 30, 'year-2025': 40 },
    ]);
  });

  it('preserves null values and normalizes missing/non-numeric series values to null', () => {
    const chartConfig: ChartConfig = {
      series: [
        { key: 'first', name: 'First' },
        { key: 'second', name: 'Second' },
      ],
      data: [{ name: 'Category 1', first: null }],
    };

    const dataset = mapChartConfigToEChartsDataset(chartConfig);

    expect(dataset.source).toEqual([
      { name: 'Category 1', first: null, second: null },
    ]);
  });
});

describe('validatePopulationPyramidInput', () => {
  it('returns valid result for one two-value dimension, one multi-value dimension and single-value remaining dimensions', () => {
    const pxtable = createPyramidPxTable();

    const result = validatePopulationPyramidInput(pxtable);

    expect(result).toEqual({
      isValid: true,
      twoValueDimensionId: 'sex',
      multiValueDimensionId: 'age',
    });
  });

  it('returns missing two-value dimension when no dimension has exactly two values', () => {
    const pxtable = createPyramidPxTable({ sexCount: 1 });

    const result = validatePopulationPyramidInput(pxtable);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('MISSING_TWO_VALUE_DIMENSION');
  });

  it('returns multiple two-value dimensions when more than one dimension has exactly two values', () => {
    const pxtable = createPyramidPxTable({ regionCount: 2 });

    const result = validatePopulationPyramidInput(pxtable);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('MULTIPLE_TWO_VALUE_DIMENSIONS');
  });

  it('returns missing multi-value dimension when no dimension has several values', () => {
    const pxtable = createPyramidPxTable({
      ageCount: 1,
      regionCount: 1,
      timeCount: 1,
    });

    const result = validatePopulationPyramidInput(pxtable);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('MISSING_MULTI_VALUE_DIMENSION');
  });

  it('returns multiple multi-value dimensions when more than one dimension has several values', () => {
    const pxtable = createPyramidPxTable({ regionCount: 3 });

    const result = validatePopulationPyramidInput(pxtable);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('MULTIPLE_MULTI_VALUE_DIMENSIONS');
  });

  it('returns non-single remaining dimensions when dimensions outside pyramid split are not single-valued', () => {
    const pxtable = createPyramidPxTable({ timeCount: 0 });

    const result = validatePopulationPyramidInput(pxtable);

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('NON_SINGLE_VALUE_REMAINING_DIMENSIONS');
  });
});

describe('mapPxTableToPopulationPyramid', () => {
  it('maps valid pyramid data with left and right series names from the two-value dimension', () => {
    const pxtable = createPyramidPxTable();

    const result = mapPxTableToPopulationPyramid(pxtable);

    expect(result.validation.isValid).toBe(true);
    expect(result.config).toBeDefined();
    expect(result.config?.leftSeriesName).toBe('Sex 1');
    expect(result.config?.rightSeriesName).toBe('Sex 2');
    expect(result.config?.data).toEqual([
      { name: 'Age 1', left: 111, right: 211 },
      { name: 'Age 2', left: 121, right: 221 },
      { name: 'Age 3', left: 131, right: 231 },
    ]);
  });

  it('returns only validation result when input is invalid', () => {
    const pxtable = createPyramidPxTable({
      ageCount: 1,
      regionCount: 1,
      timeCount: 1,
    });

    const result = mapPxTableToPopulationPyramid(pxtable);

    expect(result.validation.isValid).toBe(false);
    expect(result.validation.reason).toBe('MISSING_MULTI_VALUE_DIMENSION');
    expect(result.config).toBeUndefined();
  });
});
