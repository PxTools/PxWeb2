import React from 'react';
import { act, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { describe, it, expect, beforeEach } from 'vitest';

import {
  renderWithProviders,
  mockTableService,
} from '../../util/testing-utils';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import type { PathElement } from '@pxweb2/pxweb2-ui';

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

// Additional integration-style test: verify pathElements are preserved on codelist change

// Capture initial and post-change pathElements ids
const capture: { initial?: string[]; after?: string[] } = {};

// Hold last handleCodeListChange reference from VariableList
let latestHandleCodeListChange: ((o: SelectOption, id: string) => void) | null =
  null;

type VariableListMockProps = {
  pxTableMetadata: PxTableMetadata | null;
  handleCodeListChange: (selected: SelectOption, varId: string) => void;
};

// Partially mock ui lib to keep exports but stub VariableList to capture handleCodeListChange
vi.mock('@pxweb2/pxweb2-ui', async () => {
  const actual =
    await vi.importActual<typeof import('@pxweb2/pxweb2-ui')>(
      '@pxweb2/pxweb2-ui',
    );
  const React = await import('react');
  return {
    ...actual,
    VariableList: (props: VariableListMockProps) => {
      const { pxTableMetadata, handleCodeListChange } = props;
      // expose handler to the test
      latestHandleCodeListChange = handleCodeListChange;
      React.useEffect(() => {
        // record initial snapshot once available
        if (
          pxTableMetadata &&
          !capture.initial &&
          pxTableMetadata.pathElements
        ) {
          capture.initial = pxTableMetadata.pathElements.map(
            (p: PathElement) => p.id,
          );
        }
        // capture after when available
        if (
          pxTableMetadata &&
          capture.initial &&
          !capture.after &&
          pxTableMetadata.pathElements
        ) {
          capture.after = pxTableMetadata.pathElements.map(
            (p: PathElement) => p.id,
          );
        }
      }, [pxTableMetadata, handleCodeListChange]);
      return React.createElement('div', {
        'data-testid': 'variable-list-stub',
      });
    },
  } as typeof actual;
});

// Install default API client mocks
mockTableService();

describe('Selection (integration): preserves pathElements on codelist change', () => {
  beforeEach(() => {
    capture.initial = undefined;
    capture.after = undefined;
  });

  it('keeps pathElements after codelist change', async () => {
    const { TablesService } = await import('@pxweb2/pxweb2-api-client');

    // Ensure initial table call includes subjectCode and paths used for pathElements mapping
    (TablesService.getTableById as unknown as Mock).mockResolvedValue({
      id: 'TAB638',
      label: 'Population ...',
      language: 'en',
      languages: ['sv', 'en'],
      elimination: false,
      type: 'Table',
      subjectCode: 'SUBJ',
      paths: [
        [
          { id: 'SUBJ', label: 'Subject' },
          { id: 'CHILD', label: 'Child' },
        ],
      ],
      links: [],
    });

    const { default: Selection } = await import('./Selection');

    await act(async () => {
      renderWithProviders(
        React.createElement(
          AccessibilityProvider,
          null,
          React.createElement(Selection, {
            openedWithKeyboard: false,
            selectedNavigationView: 'selection',
            selectedTabId: '1',
            setSelectedNavigationView: vi.fn(),
          }),
        ),
      );
    });

    // Initial pathElements set from getTableById paths
    await waitFor(() => {
      expect(capture.initial).toEqual(['SUBJ', 'CHILD']);
    });

    // Trigger codelist change explicitly after initial snapshot
    expect(latestHandleCodeListChange).toBeTruthy();
    const option: SelectOption = { value: 'vs_RegionLän07', label: 'County' };
    latestHandleCodeListChange?.(option, 'Region');

    // After codelist change, pathElements should be preserved
    await waitFor(() => {
      expect(capture.after).toEqual(capture.initial);
    });
  });
});
