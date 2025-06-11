import { describe, it, expect, beforeEach } from 'vitest';
import {
  updateSelectedCodelistForVariable,
  addSelectedCodeListToVariable,
  getSelectedCodelists,
} from './selectionUtils';
import {
  SelectedVBValues,
  SelectOption,
  Variable,
  VartypeEnum,
} from '@pxweb2/pxweb2-ui';

describe('selectionUtils', () => {
  const varId = 'var1';
  const codeListA = { id: 'A', label: 'List A', values: [] };
  const codeListB = { id: 'B', label: 'List B', values: [] };

  const selectOptionA: SelectOption = { label: 'List A', value: 'A' };
  const selectOptionB: SelectOption = { label: 'List B', value: 'B' };

  const variableMeta: Variable = {
    id: varId,
    codeLists: [codeListA, codeListB],
    label: '',
    type: VartypeEnum.CONTENTS_VARIABLE,
    mandatory: false,
    values: [],
  };

  let prevSelectedValues: SelectedVBValues[];

  beforeEach(() => {
    prevSelectedValues = [
      { id: varId, selectedCodeList: 'A', values: ['x'] },
      { id: 'var2', selectedCodeList: 'C', values: ['y'] },
    ];
  });

  describe('setSelectedCodelist', () => {
    it('returns undefined if no selectedItem is provided', () => {
      const result = updateSelectedCodelistForVariable(
        undefined,
        varId,
        prevSelectedValues,
        variableMeta,
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined if selectedItem.value equals current selectedCodeList', () => {
      const result = updateSelectedCodelistForVariable(
        selectOptionA,
        varId,
        prevSelectedValues,
        variableMeta,
      );
      expect(result).toBeUndefined();
    });

    it('returns undefined if newSelectedCodeList is not found', () => {
      const invalidOption: SelectOption = { label: 'Invalid', value: 'Z' };
      const result = updateSelectedCodelistForVariable(
        invalidOption,
        varId,
        prevSelectedValues,
        variableMeta,
      );
      expect(result).toBeUndefined();
    });

    it('returns new selected values when a new codelist is selected', () => {
      const result = updateSelectedCodelistForVariable(
        selectOptionB,
        varId,
        prevSelectedValues,
        variableMeta,
      );
      expect(result).toBeDefined();
      expect(result?.find((v) => v.id === varId)?.selectedCodeList).toBe('B');
      expect(result?.find((v) => v.id === varId)?.values).toEqual([]);
    });

    it('adds a new variable if it does not exist in prevSelectedValues', () => {
      const newVarId = 'var3';
      const newMeta: Variable = {
        id: newVarId,
        codeLists: [codeListA],
        label: '',
        type: VartypeEnum.CONTENTS_VARIABLE,
        mandatory: false,
        values: [],
      };
      const result = updateSelectedCodelistForVariable(
        selectOptionA,
        newVarId,
        prevSelectedValues,
        newMeta,
      );
      expect(result?.find((v) => v.id === newVarId)?.selectedCodeList).toBe(
        'A',
      );
    });
  });

  describe('addSelectedCodeListToVariable', () => {
    it('updates existing variable with new selectedCodeList and resets values', () => {
      const currentVariable = prevSelectedValues[0];
      const result = addSelectedCodeListToVariable(
        currentVariable,
        prevSelectedValues,
        varId,
        selectOptionB,
      );
      expect(result.find((v) => v.id === varId)?.selectedCodeList).toBe('B');
      expect(result.find((v) => v.id === varId)?.values).toEqual([]);
    });

    it('adds a new variable if currentVariable is undefined', () => {
      const result = addSelectedCodeListToVariable(
        undefined,
        prevSelectedValues,
        'var3',
        selectOptionA,
      );
      expect(result.find((v) => v.id === 'var3')?.selectedCodeList).toBe('A');
      expect(result.find((v) => v.id === 'var3')?.values).toEqual([]);
    });
  });

  describe('getSelectedCodelists', () => {
    it('returns selected codelists for all variables', () => {
      const result = getSelectedCodelists(prevSelectedValues, undefined, varId);
      expect(result).toEqual({
        var1: 'A',
        var2: 'C',
      });
    });

    it('overwrites the selected codelist for the given varId if selectedItem is provided', () => {
      const result = getSelectedCodelists(
        prevSelectedValues,
        selectOptionB,
        varId,
      );
      expect(result).toEqual({
        var1: 'B',
        var2: 'C',
      });
    });

    it('adds a new selected codelist if varId is not in prevSelectedValues', () => {
      const result = getSelectedCodelists(
        prevSelectedValues,
        selectOptionA,
        'var3',
      );
      expect(result).toEqual({
        var1: 'A',
        var2: 'C',
        var3: 'A',
      });
    });
  });
});
