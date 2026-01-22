import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNormalizedOutput, useApiQueryInfo } from './apiQueryUtil';

// Local mock types to avoid `any`
type MockVariables = {
  getUniqueIds: () => string[];
  getSelectedCodelistById: (id: string) => string | undefined;
  getSelectedValuesByIdSorted: (id: string) => string[];
  pxTableMetadata?: {
    id?: string;
    variables?: Array<{ id: string; values: string[] }>;
  };
};

type MockTableData = {
  data?: {
    heading?: Array<{ id: string }>;
    stub?: Array<{ id: string }>;
  };
};

// Mock dependencies used inside apiQueryUtil
vi.mock('../../context/useVariables', () => {
  // Will be set per-test in beforeEach
  let mockVariables: MockVariables = {
    getUniqueIds: () => [],
    getSelectedCodelistById: () => undefined,
    getSelectedValuesByIdSorted: () => [],
    pxTableMetadata: undefined,
  };
  return {
    default: () => mockVariables,
    // helper to update in tests
    __setMock: (v: MockVariables) => {
      mockVariables = v;
    },
  };
});

vi.mock('../../context/useTableData', () => {
  let mockTableData: MockTableData = { data: {} };
  return {
    default: () => mockTableData,
    __setMock: (d: MockTableData) => {
      mockTableData = d;
    },
  };
});

// Import mocked modules to access setter helpers
import * as useVariablesModule from '../../context/useVariables';
import * as useTableDataModule from '../../context/useTableData';
const setUseVariablesMock = (
  useVariablesModule as unknown as { __setMock: (v: MockVariables) => void }
).__setMock;
const setUseTableDataMock = (
  useTableDataModule as unknown as { __setMock: (d: MockTableData) => void }
).__setMock;

describe('getNormalizedOutput', () => {
  it('returns default when empty or whitespace', () => {
    expect(getNormalizedOutput('')).toBe('json-stat2');
    expect(getNormalizedOutput('   ')).toBe('json-stat2');
  });

  it('normalizes known aliases', () => {
    expect(getNormalizedOutput('jsonstat2')).toBe('json-stat2');
    expect(getNormalizedOutput('excel')).toBe('xlsx');
  });

  it('passes through other formats', () => {
    expect(getNormalizedOutput('csv')).toBe('csv');
    expect(getNormalizedOutput('json')).toBe('json');
  });
});

describe('useApiQueryInfo', () => {
  beforeEach(() => {
    // Default mocks cleared before each test
    setUseVariablesMock({
      getUniqueIds: () => [],
      getSelectedCodelistById: () => undefined,
      getSelectedValuesByIdSorted: () => [],
      pxTableMetadata: undefined,
    });
    setUseTableDataMock({ data: { heading: undefined, stub: undefined } });
  });

  it('builds URLs with default language and normalized output', () => {
    // One variable with selected values not equal to total -> explicit list
    setUseVariablesMock({
      getUniqueIds: () => ['var1'],
      getSelectedCodelistById: (id: string) =>
        id === 'var1' ? 'CL1' : undefined,
      getSelectedValuesByIdSorted: (id: string) =>
        id === 'var1' ? ['A', 'B'] : [],
      pxTableMetadata: {
        id: 'TABLE_123',
        variables: [{ id: 'var1', values: ['A', 'B', 'C'] }],
      },
    });
    setUseTableDataMock({
      data: {
        heading: [{ id: 'var1' }],
        stub: [{ id: 'var2' }],
      },
    });

    const info = useApiQueryInfo(undefined, 'jsonstat2');
    // apiUrl is mocked to '' in setupTests, so path starts with /tables
    expect(info.postUrl).toContain('/tables/TABLE_123/data?');
    expect(info.postUrl).toContain('lang=en');
    expect(info.postUrl).toContain('outputFormat=json-stat2');

    // GET params include values, codelist, heading, and stub
    expect(info.getUrl).toContain('valuecodes[var1]=A,B');
    expect(info.getUrl).toContain('codelist[var1]=CL1');
    expect(info.getUrl).toContain('heading=var1');
    expect(info.getUrl).toContain('stub=var2');

    // POST body mirrors selection and placement
    const parsed = JSON.parse(info.postBody);
    expect(parsed.selection).toEqual([
      { variableCode: 'var1', valueCodes: ['A', 'B'], codelist: 'CL1' },
    ]);
    expect(parsed.placement).toEqual({ heading: ['var1'], stub: ['var2'] });
  });

  it('uses "*" when all values selected and normalizes excel to xlsx', () => {
    // When selected values length equals variable.values length -> use ["*"]
    setUseVariablesMock({
      getUniqueIds: () => ['v'],
      getSelectedCodelistById: () => undefined,
      getSelectedValuesByIdSorted: () => ['1', '2', '3'],
      pxTableMetadata: {
        id: 'T',
        variables: [{ id: 'v', values: ['1', '2', '3'] }],
      },
    });
    setUseTableDataMock({ data: {} });

    const info = useApiQueryInfo('no', 'excel');
    expect(info.postUrl).toContain('/tables/T/data?');
    expect(info.postUrl).toContain('lang=no');
    expect(info.postUrl).toContain('outputFormat=xlsx');

    // GET params should contain "*"
    expect(info.getUrl).toContain('valuecodes[v]=*');

    const parsed = JSON.parse(info.postBody);
    expect(parsed.selection).toEqual([
      { variableCode: 'v', valueCodes: ['*'] },
    ]);
    expect(parsed.placement).toBeUndefined();
  });

  it('falls back to placeholder table when table id missing', () => {
    setUseVariablesMock({
      getUniqueIds: () => [],
      getSelectedCodelistById: () => undefined,
      getSelectedValuesByIdSorted: () => [],
      pxTableMetadata: { id: undefined },
    });
    setUseTableDataMock({ data: {} });

    const info = useApiQueryInfo();
    // When no id, it should use /tables/tableId/data
    expect(info.postUrl).toContain('/tables/tableId/data?');
  });
});
