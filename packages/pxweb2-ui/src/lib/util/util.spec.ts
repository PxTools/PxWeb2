import { describe, it, expect, beforeEach } from 'vitest';

import {
  getCSSVariable,
  mapCodeListToSelectOption,
  mapCodeListsToSelectOptions,
} from './util';
import { CodeList } from '../shared-types/codelist';
import { SelectOption } from '../components/Select/Select';

describe('getCSSVariable', () => {
  beforeEach(() => {
    const style = document.createElement('style');
    style.innerHTML = ':root { --test-variable: #123456; }';

    document.head.appendChild(style);
  });

  it('should return the value of a CSS variable', () => {
    const result = getCSSVariable('--test-variable');

    expect(result).toBe('#123456');
  });
});

describe('mapCodeListToSelectOption', () => {
  it('should map a CodeList to a SelectOption', () => {
    const codeList: CodeList = { id: '1', label: 'Option 1' };
    const result: SelectOption = mapCodeListToSelectOption(codeList);

    expect(result).toEqual({ label: 'Option 1', value: '1' });
  });
});

describe('mapCodeListsToSelectOptions', () => {
  it('should map an array of CodeLists to an array of SelectOptions', () => {
    const codeLists: CodeList[] = [
      { id: '1', label: 'Option 1' },
      { id: '2', label: 'Option 2' },
    ];
    const result: SelectOption[] = mapCodeListsToSelectOptions(codeLists);

    expect(result).toEqual([
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ]);
  });
});
