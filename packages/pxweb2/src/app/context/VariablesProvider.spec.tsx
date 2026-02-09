import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';

import {
  VariablesProvider,
  VariablesContext,
  VariablesContextType,
} from './VariablesProvider';

vi.mock('../util/config/getConfig', () => ({
  getConfig: () => ({
    maxDataCells: 3,
  }),
}));

function Consumer({
  onRender,
}: {
  readonly onRender: (ctx: VariablesContextType) => void;
}) {
  return (
    <VariablesContext.Consumer>
      {(value) => {
        onRender(value);
        return null;
      }}
    </VariablesContext.Consumer>
  );
}

describe('VariablesProvider', () => {
  let captured: VariablesContextType | null = null;

  beforeEach(() => {
    captured = null;
    vi.clearAllMocks();
  });

  it('provides context with expected defaults', () => {
    render(
      <VariablesProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </VariablesProvider>,
    );

    expect(captured).toBeTruthy();
    expect(captured!.isInitialized).toBe(true);
    expect(captured!.getNumberOfSelectedValues()).toBe(0);
    expect(captured!.getUniqueIds()).toEqual([]);
    expect(captured!.isMatrixSizeAllowed).toBe(true);
    expect(captured!.getSelectedMatrixSize()).toBe(1);
  });

  it('addSelectedValues tracks values and ids', () => {
    render(
      <VariablesProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </VariablesProvider>,
    );

    act(() => {
      captured!.addSelectedValues('A', ['1', '2']);
    });

    expect(captured!.getSelectedValuesById('A')).toEqual(['1', '2']);
    expect(captured!.getNumberOfSelectedValues()).toBe(2);
    expect(captured!.getUniqueIds()).toEqual(['A']);

    act(() => {
      captured!.addSelectedValues('B', []);
    });

    expect(captured!.getSelectedValuesById('B')).toEqual(['none-selected']);
    expect(captured!.getUniqueIds().sort((a, b) => a.localeCompare(b))).toEqual(
      ['A', 'B'],
    );
  });

  it('syncVariablesAndValues replaces selection and computes matrix size + allowance', () => {
    render(
      <VariablesProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </VariablesProvider>,
    );

    act(() => {
      captured!.syncVariablesAndValues([
        { id: 'A', values: ['1', '2'] } as unknown as never,
        { id: 'B', values: ['x', 'y'] } as unknown as never,
      ] as unknown as never);
    });

    expect(captured!.getSelectedMatrixSize()).toBe(4);
    expect(captured!.isMatrixSizeAllowed).toBe(false);
    expect(captured!.getSelectedValuesById('A')).toEqual(['1', '2']);

    act(() => {
      captured!.syncVariablesAndValues([
        { id: 'A', values: ['1'] } as unknown as never,
        { id: 'B', values: [] } as unknown as never,
      ] as unknown as never);
    });

    expect(captured!.getSelectedMatrixSize()).toBe(1);
    expect(captured!.isMatrixSizeAllowed).toBe(true);
    expect(captured!.getSelectedValuesById('B')).toEqual(['none-selected']);
  });

  it('getSelectedCodelistById and getSelectedValuesByIdSorted use metadata + selectedVBValues', () => {
    render(
      <VariablesProvider>
        <Consumer onRender={(ctx) => (captured = ctx)} />
      </VariablesProvider>,
    );

    act(() => {
      captured!.setSelectedVBValues([
        {
          id: 'A',
          values: ['1', '3'],
          selectedCodeList: 'CL1',
        } as unknown as never,
      ] as unknown as never);

      captured!.setPxTableMetadata({
        variables: [
          {
            id: 'A',
            values: [{ code: '2' }, { code: '1' }, { code: '3' }],
          },
        ],
      } as unknown as never);
    });

    expect(captured!.getSelectedCodelistById('A')).toBe('CL1');
    expect(captured!.getSelectedValuesByIdSorted('A')).toEqual(['1', '3']);
  });
});
