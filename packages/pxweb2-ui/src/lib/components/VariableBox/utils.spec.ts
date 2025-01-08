import { describe, it, expect } from 'vitest';

import { CodeList } from '../../shared-types/codelist';
import { SelectOption } from '../Select/Select';
import { sortSelectOptionsGroupingsLast, mapAndSortCodeLists } from './utils';

describe('sortSelectOptionsGroupingsFirst', () => {
  it('should sort options with "vs_" prefix to the top', () => {
    const options: SelectOption[] = [
      { label: 'VS Option 1', value: 'vs_1' },
      { label: 'Option 1', value: '1' },
      { label: 'VS Option 2', value: 'vs_2' },
      { label: 'Option 2', value: '2' },
      { label: 'VS Option 3', value: 'vs_3' },
    ];
    const result: SelectOption[] = sortSelectOptionsGroupingsLast(options);

    expect(result).toEqual([
      { label: 'VS Option 1', value: 'vs_1' },
      { label: 'VS Option 2', value: 'vs_2' },
      { label: 'VS Option 3', value: 'vs_3' },
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ]);
  });

  it('should return an empty array if options is empty', () => {
    const result: SelectOption[] = sortSelectOptionsGroupingsLast([]);

    expect(result).toEqual([]);
  });

  it('should work when there are no options vs_ prefix', () => {
    const options: SelectOption[] = [
      { label: 'AGG Option 1', value: 'agg_1' },
      { label: 'AGG Option 2', value: 'agg_2' },
    ];
    const result: SelectOption[] = sortSelectOptionsGroupingsLast(options);

    expect(result).toEqual([
      { label: 'AGG Option 1', value: 'agg_1' },
      { label: 'AGG Option 2', value: 'agg_2' },
    ]);
  });

  it('should work when there are no options agg_ prefix', () => {
    const options: SelectOption[] = [
      { label: 'VS Option 1', value: 'vs_1' },
      { label: 'VS Option 2', value: 'vs_2' },
      { label: 'VS Option 3', value: 'vs_3' },
    ];
    const result: SelectOption[] = sortSelectOptionsGroupingsLast(options);

    expect(result).toEqual([
      { label: 'VS Option 1', value: 'vs_1' },
      { label: 'VS Option 2', value: 'vs_2' },
      { label: 'VS Option 3', value: 'vs_3' },
    ]);
  });
});

describe('mapAndSortCodeLists', () => {
  it('should return an empty array if codeLists is undefined', () => {
    const result = mapAndSortCodeLists(undefined);

    expect(result).toEqual([]);
  });

  it('should return an empty array if codeLists is empty', () => {
    const result = mapAndSortCodeLists([]);

    expect(result).toEqual([]);
  });

  it('should map codeLists to select options without sorting if no sorting is needed', () => {
    const codeLists: CodeList[] = [
      { id: 'test_1', label: 'Test 1' },
      { id: 'test_2', label: 'Test 2' },
    ];
    const expected: SelectOption[] = [
      { value: 'test_1', label: 'Test 1' },
      { value: 'test_2', label: 'Test 2' },
    ];
    const result = mapAndSortCodeLists(codeLists);

    expect(result).toEqual(expected);
  });

  it('should map and sort codeLists if sorting is needed', () => {
    const codeLists: CodeList[] = [
      { id: 'agg_test', label: 'AGG Test' },
      { id: 'vs_test', label: 'VS Test' },
    ];
    const expected: SelectOption[] = [
      { value: 'vs_test', label: 'VS Test' },
      { value: 'agg_test', label: 'AGG Test' },
    ];
    const result = mapAndSortCodeLists(codeLists);

    expect(result).toEqual(expected);
  });
});
