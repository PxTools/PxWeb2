import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  getFormattedValue,
  addFormattingToPxTable,
  filterStubAndHeadingArrays,
} from './TableDataProviderUtils';
import { DataCell, PxTable, PxData, VartypeEnum } from '@pxweb2/pxweb2-ui';

// Mock dependencies
vi.mock('../util/language/translateOutsideReact', () => ({
  translateOutsideReactWithParams: vi.fn((key, params) => {
    // Simple mock that returns the value with appropriate formatting
    if (key === 'number.simple_number_with_zero_decimal') {
      return Promise.resolve(`${Math.round(params.value)}`);
    } else if (key === 'number.simple_number_with_one_decimal') {
      return Promise.resolve(`${params.value.toFixed(1)}`);
    } else if (key === 'number.simple_number_with_two_decimals') {
      return Promise.resolve(`${params.value.toFixed(2)}`);
    } else if (key === 'number.simple_number_with_three_decimals') {
      return Promise.resolve(`${params.value.toFixed(3)}`);
    } else if (key === 'number.simple_number_with_four_decimals') {
      return Promise.resolve(`${params.value.toFixed(4)}`);
    } else if (key === 'number.simple_number_with_five_decimals') {
      return Promise.resolve(`${params.value.toFixed(5)}`);
    } else if (key === 'number.simple_number_with_six_decimals') {
      return Promise.resolve(`${params.value.toFixed(6)}`);
    } else {
      return Promise.resolve(`${params.value}`);
    }
  }),
}));

describe('TableDataProviderUtils', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper function to create a base PxTable for testing
  // This does mean that we get type errors when using the overrides
  const createBasePxTable = (overrides: Partial<PxTable> = {}): PxTable => {
    return {
      metadata: {
        decimals: 2,
        variables: [],
        id: 'testTable',
        language: 'en',
        label: 'Test Table',
        updated: new Date(2023, 0, 1),
        source: 'Test Source',
        infofile: 'Test Infofile',
        officialStatistics: false,
        aggregationAllowed: true,
        matrix: 'Test Matrix',
        contents: 'Test Contents',
        contacts: [],
        descriptionDefault: false,
        subjectArea: 'Test Subject Area',
        subjectCode: 'Test Subject Code',
        notes: [],
        ...(overrides.metadata || {}),
      },
      data: {
        variableOrder: [],
        isLoaded: true,
        cube: {
          cell1: { value: 123.456 },
          cell2: { value: 789.012 },
        },
        ...(overrides.data || {}),
      },
      stub: [],
      heading: [],
      ...overrides,
    };
  };

  describe('getFormattedValue', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return formatted value for valid dataCell with status', async () => {
      const dataCell = {
        value: 123.456,
        status: 'OK',
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46OK');
    });

    it('should return formatted value for valid dataCell without status', async () => {
      const dataCell = {
        value: 42.789,
      };

      const result = await getFormattedValue(dataCell, 1);

      expect(result).toBe('42.8');
    });

    it('should return empty string for undefined dataCell', async () => {
      const result = await getFormattedValue(undefined, 2);

      expect(result).toBe('');
    });

    it('should handle null value with status', async () => {
      const dataCell = {
        value: null,
        status: 'N/A',
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('N/A');
    });

    it('should handle different decimal places', async () => {
      const testCases = [
        { decimals: 0, expected: '123' },
        { decimals: 1, expected: '123.5' },
        { decimals: 2, expected: '123.46' },
        { decimals: 3, expected: '123.457' },
        { decimals: 4, expected: '123.4568' },
        { decimals: 5, expected: '123.45679' },
        { decimals: 6, expected: '123.456789' },
      ];

      for (const { decimals, expected } of testCases) {
        const dataCell = {
          value: 123.456789,
          status: '',
        };

        const result = await getFormattedValue({ ...dataCell }, decimals);
        expect(result).toBe(expected);
      }
    });

    it('should handle invalid decimal places by using fallback format', async () => {
      const dataCell = {
        value: 123.456,
        status: '',
      };

      const result = await getFormattedValue(dataCell, 10); // Invalid decimal places (> 5)

      expect(result).toBe('123.456'); // Should use fallback 'number.simple_number'
    });

    it('should handle zero value', async () => {
      const dataCell = {
        value: 0,
        status: '',
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('0.00');
    });

    it('should handle negative values', async () => {
      const dataCell = {
        value: -123.456,
        status: '',
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('-123.46');
    });

    it('should append status to formatted value', async () => {
      const dataCell = {
        value: 123.456,
        status: '*',
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46*');
    });

    it('should handle empty status as empty string', async () => {
      const dataCell = {
        value: 123.456,
        status: '',
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46');
    });

    it('should handle missing status property', async () => {
      const dataCell = {
        value: 123.456,
      };

      const result = await getFormattedValue(dataCell, 2);

      expect(result).toBe('123.46');
    });
  });

  describe('addFormattingToPxTable', () => {
    it('should return false if input is null or undefined', async () => {
      const result1 = await addFormattingToPxTable(null as unknown as PxTable);
      const result2 = await addFormattingToPxTable(
        undefined as unknown as PxTable,
      );

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it('should format data cells in a table with default decimals', async () => {
      const pxTable = createBasePxTable();
      const result = await addFormattingToPxTable(pxTable);

      expect(result).toBe(true);
      expect(pxTable.data.cube).toEqual({
        cell1: { value: 123.456, formattedValue: '123.46' },
        cell2: { value: 789.012, formattedValue: '789.01' },
      });
    });

    it('should safely handle two-level nested structures', async () => {
      const pxTable = createBasePxTable({
        metadata: {
          decimals: 1,
        },
        data: {
          variableOrder: ['dim1', 'dim2'],
          isLoaded: true,
          cube: {
            level1_item1: {
              level2_item1: { value: 123.456 },
              level2_item2: { value: 789.012 },
            },
            level1_item2: {
              level2_item1: { value: 456.789 },
            },
          },
        },
      });

      const result = await addFormattingToPxTable(pxTable);

      expect(result).toBe(true);
      expect(pxTable.data.cube).toEqual({
        level1_item1: {
          level2_item1: { value: 123.456, formattedValue: '123.5' },
          level2_item2: { value: 789.012, formattedValue: '789.0' },
        },
        level1_item2: {
          level2_item1: { value: 456.789, formattedValue: '456.8' },
        },
      });
    });

    it('should format data cells with content variable specific decimals', async () => {
      const pxTable = createBasePxTable({
        metadata: {
          variables: [
            {
              id: 'contents',
              type: VartypeEnum.CONTENTS_VARIABLE,
              label: 'Contents',
              mandatory: true,
              values: [
                {
                  code: 'val1',
                  label: 'Value 1',
                  contentInfo: {
                    basePeriod: '',
                    decimals: 0,
                    unit: 'pcs',
                    referencePeriod: '2023-10',
                  },
                },
                {
                  code: 'val2',
                  label: 'Value 2',
                  contentInfo: {
                    basePeriod: '',
                    decimals: 1,
                    unit: 'pcs',
                    referencePeriod: '2023-10',
                  },
                },
              ],
            },
          ],
        },
        data: {
          variableOrder: ['contents'],
          cube: {
            val1: { value: 123.456 },
            val2: { value: 789.012 },
          },
        },
      });

      const result = await addFormattingToPxTable(pxTable);

      expect(result).toBe(true);
      expect(pxTable.data.cube).toEqual({
        val1: { value: 123.456, formattedValue: '123' },
        val2: { value: 789.012, formattedValue: '789.0' },
      });
    });

    it('should handle deeply nested data structures', async () => {
      const pxTable = createBasePxTable({
        metadata: {
          decimals: 1,
        },
        data: {
          cube: {
            group1: {
              subgroup: {
                cell1: { value: 123.456 },
              },
            },
            group2: {
              cell2: { value: 789.012 },
            },
          } as unknown as PxData<DataCell>,
        },
      });

      const result = await addFormattingToPxTable(pxTable);

      expect(result).toBe(true);
      expect(pxTable.data.cube).toEqual({
        group1: {
          subgroup: {
            cell1: { value: 123.456, formattedValue: '123.5' },
          },
        },
        group2: {
          cell2: { value: 789.012, formattedValue: '789.0' },
        },
      });
    });

    it('should handle cells with null values', async () => {
      const pxTable = createBasePxTable({
        data: {
          cube: {
            cell1: { value: null },
            cell2: { value: 789.012 },
          },
        },
      });

      const result = await addFormattingToPxTable(pxTable);

      expect(result).toBe(true);
      expect(pxTable.data.cube).toEqual({
        cell1: { value: null, formattedValue: '' },
        cell2: { value: 789.012, formattedValue: '789.01' },
      });
    });
  });

  describe('filterStubAndHeadingArrays', () => {
    it('filters stub and heading arrays to only include variable IDs present in variableIds', () => {
      const variableIds = ['a', 'c', 'e'];
      const stubDesktop = ['a', 'b', 'c'];
      const headingDesktop = ['d', 'e', 'f'];
      const stubMobile = ['a', 'e', 'g'];
      const headingMobile = ['c', 'h', 'i'];

      const result = filterStubAndHeadingArrays(
        variableIds,
        stubDesktop,
        headingDesktop,
        stubMobile,
        headingMobile,
      );

      expect(result.stubDesktop).toEqual(['a', 'c']);
      expect(result.headingDesktop).toEqual(['e']);
      expect(result.stubMobile).toEqual(['a', 'e']);
      expect(result.headingMobile).toEqual(['c']);
    });

    it('returns empty arrays if no variableIds match', () => {
      const variableIds = ['x', 'y', 'z'];
      const stubDesktop = ['a', 'b'];
      const headingDesktop = ['c', 'd'];
      const stubMobile = ['e', 'f'];
      const headingMobile = ['g', 'h'];

      const result = filterStubAndHeadingArrays(
        variableIds,
        stubDesktop,
        headingDesktop,
        stubMobile,
        headingMobile,
      );

      expect(result.stubDesktop).toEqual([]);
      expect(result.headingDesktop).toEqual([]);
      expect(result.stubMobile).toEqual([]);
      expect(result.headingMobile).toEqual([]);
    });

    it('returns original arrays if all variableIds match', () => {
      const variableIds = ['a', 'b', 'c'];
      const stubDesktop = ['a', 'b', 'c'];
      const headingDesktop = ['a', 'b', 'c'];
      const stubMobile = ['a', 'b', 'c'];
      const headingMobile = ['a', 'b', 'c'];

      const result = filterStubAndHeadingArrays(
        variableIds,
        stubDesktop,
        headingDesktop,
        stubMobile,
        headingMobile,
      );

      expect(result.stubDesktop).toEqual(['a', 'b', 'c']);
      expect(result.headingDesktop).toEqual(['a', 'b', 'c']);
      expect(result.stubMobile).toEqual(['a', 'b', 'c']);
      expect(result.headingMobile).toEqual(['a', 'b', 'c']);
    });
  });
});
