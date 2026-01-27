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
  PxTableMetadata,
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
    it('returns undefined if newSelectedCodeList is not found', () => {
      const invalidOption: SelectOption = { label: 'Invalid', value: 'Z' };
      const mockMetadata: PxTableMetadata = {
        variables: [variableMeta],
        id: 'test-table',
        language: 'en',
        label: 'Test Table',
        description: 'Test description',
        source: 'Test source',
        updated: new Date('2024-01-01'),
        infofile: 'test.info',
        decimals: 2,
        officialStatistics: false,
        aggregationAllowed: false,
        contents: 'Test contents',
        descriptionDefault: false,
        matrix: 'test-matrix',
        subjectCode: 'test-subject',
        subjectArea: 'test-area',
        contacts: [],
        notes: [],
      };
      const result = updateSelectedCodelistForVariable(
        invalidOption,
        varId,
        prevSelectedValues,
        variableMeta,
        mockMetadata,
      );

      expect(result).toBeUndefined();
    });

    it('returns new selected values when a new codelist is selected', () => {
      const mockMetadata: PxTableMetadata = {
        variables: [variableMeta],
        id: 'test-table',
        language: 'en',
        label: 'Test Table',
        description: 'Test description',
        source: 'Test source',
        updated: new Date('2024-01-01'),
        infofile: 'test.info',
        decimals: 2,
        officialStatistics: false,
        aggregationAllowed: false,
        contents: 'Test contents',
        descriptionDefault: false,
        matrix: 'test-matrix',
        subjectCode: 'test-subject',
        subjectArea: 'test-area',
        contacts: [],
        notes: [],
      };
      const result = updateSelectedCodelistForVariable(
        selectOptionB,
        varId,
        prevSelectedValues,
        variableMeta,
        mockMetadata,
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
      const mockMetadata: PxTableMetadata = {
        variables: [newMeta],
        id: 'test-table',
        language: 'en',
        label: 'Test Table',
        description: 'Test description',
        source: 'Test source',
        updated: new Date('2024-01-01'),
        infofile: 'test.info',
        decimals: 2,
        officialStatistics: false,
        aggregationAllowed: false,
        contents: 'Test contents',
        descriptionDefault: false,
        matrix: 'test-matrix',
        subjectCode: 'test-subject',
        subjectArea: 'test-area',
        contacts: [],
        notes: [],
      };
      const result = updateSelectedCodelistForVariable(
        selectOptionA,
        newVarId,
        prevSelectedValues,
        newMeta,
        mockMetadata,
      );

      expect(result?.find((v) => v.id === newVarId)?.selectedCodeList).toBe(
        'A',
      );
    });

    it('applies mandatory defaults', () => {
      const mandatoryVariable: Variable = {
        id: varId,
        codeLists: [codeListB],
        label: '',
        type: VartypeEnum.CONTENTS_VARIABLE,
        mandatory: true,
        values: [
          { code: 'default1', label: 'Default 1' },
          { code: 'default2', label: 'Default 2' },
        ],
      };
      const mockMetadata: PxTableMetadata = {
        variables: [mandatoryVariable],
        id: 'test-table',
        language: 'en',
        label: 'Test Table',
        description: 'Test description',
        source: 'Test source',
        updated: new Date('2024-01-01'),
        infofile: 'test.info',
        decimals: 2,
        officialStatistics: false,
        aggregationAllowed: false,
        contents: 'Test contents',
        descriptionDefault: false,
        matrix: 'test-matrix',
        subjectCode: 'test-subject',
        subjectArea: 'test-area',
        contacts: [],
        notes: [],
      };
      const result = updateSelectedCodelistForVariable(
        selectOptionB,
        varId,
        prevSelectedValues,
        mandatoryVariable,
        mockMetadata,
      );

      expect(result?.find((v) => v.id === varId)?.values).toEqual(['default1']);
    });

    it('does not apply mandatory defaults when variable is not mandatory', () => {
      const nonMandatoryVariable: Variable = {
        id: varId,
        codeLists: [codeListB],
        label: '',
        type: VartypeEnum.CONTENTS_VARIABLE,
        mandatory: false,
        values: [{ code: 'value1', label: 'Value 1' }],
      };
      const mockMetadata: PxTableMetadata = {
        variables: [nonMandatoryVariable],
        id: 'test-table',
        language: 'en',
        label: 'Test Table',
        description: 'Test description',
        source: 'Test source',
        updated: new Date('2024-01-01'),
        infofile: 'test.info',
        decimals: 2,
        officialStatistics: false,
        aggregationAllowed: false,
        contents: 'Test contents',
        descriptionDefault: false,
        matrix: 'test-matrix',
        subjectCode: 'test-subject',
        subjectArea: 'test-area',
        contacts: [],
        notes: [],
      };
      const result = updateSelectedCodelistForVariable(
        selectOptionB,
        varId,
        prevSelectedValues,
        nonMandatoryVariable,
        mockMetadata,
      );

      expect(result?.find((v) => v.id === varId)?.values).toEqual([]);
    });

    it('does not apply mandatory defaults to other mandatory variables than the one with new codelist', () => {
      const varId2 = 'var2';
      const mandatoryVariable: Variable = {
        id: varId,
        codeLists: [codeListB],
        label: '',
        type: VartypeEnum.CONTENTS_VARIABLE,
        mandatory: true,
        values: [{ code: 'default1', label: 'Default 1' }],
      };
      const mandatoryVariable2: Variable = {
        id: varId2,
        codeLists: [codeListA],
        label: '',
        type: VartypeEnum.CONTENTS_VARIABLE,
        mandatory: true,
        values: [{ code: 'default2', label: 'Default 2' }],
      };
      const mockMetadata: PxTableMetadata = {
        variables: [mandatoryVariable, mandatoryVariable2],
        id: 'test-table',
        language: 'en',
        label: 'Test Table',
        description: 'Test description',
        source: 'Test source',
        updated: new Date('2024-01-01'),
        infofile: 'test.info',
        decimals: 2,
        officialStatistics: false,
        aggregationAllowed: false,
        contents: 'Test contents',
        descriptionDefault: false,
        matrix: 'test-matrix',
        subjectCode: 'test-subject',
        subjectArea: 'test-area',
        contacts: [],
        notes: [],
      };
      const prevValuesWithData = [
        { id: varId, selectedCodeList: 'A', values: ['existing'] },
        {
          id: varId2,
          selectedCodeList: 'C',
          values: ['existing-value-1', 'existing-value-2'],
        },
      ];
      const result = updateSelectedCodelistForVariable(
        selectOptionB,
        varId,
        prevValuesWithData,
        mandatoryVariable,
        mockMetadata,
      );

      // The variable we're updating should get reset and receive the default,
      // and the other mandatory variable should keep its existing values unchanged
      expect(result?.find((v) => v.id === varId)?.values).toEqual(['default1']);
      expect(result?.find((v) => v.id === varId2)?.values).toEqual([
        'existing-value-1',
        'existing-value-2',
      ]);
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
