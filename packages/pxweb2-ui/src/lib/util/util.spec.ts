import { describe, it, expect, beforeEach } from 'vitest';

import {
  getCSSVariable,
  mapCodeListToSelectOption,
  mapCodeListsToSelectOptions,
} from './util';
import { Codelist } from '../shared-types/codelist';
import { SelectOption } from '../components/Select/SelectOptionType';

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
  it('should map a Codelist to a SelectOption', () => {
    const codelist: Codelist = { id: '1', label: 'Option 1' };
    const result: SelectOption = mapCodeListToSelectOption(codelist);

    expect(result).toEqual({ label: 'Option 1', value: '1' });
  });
});

describe('mapCodeListsToSelectOptions', () => {
  it('should map an array of CodeLists to an array of SelectOptions', () => {
    const codelists: Codelist[] = [
      { id: '1', label: 'Option 1' },
      { id: '2', label: 'Option 2' },
    ];
    const result: SelectOption[] = mapCodeListsToSelectOptions(codelists);

    expect(result).toEqual([
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ]);
  });
});
