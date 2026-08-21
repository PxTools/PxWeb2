import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  checkMultipleUnits,
  getAdaptiveYAxisMax,
  getAdaptiveYAxisMin,
  getChartColorsFromCssVariables,
} from './chartHelper';
import type { PxTable } from '../../../shared-types/pxTable';
import type { Variable } from '../../../shared-types/variable';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';

function mockStyles(values: Record<string, string>): CSSStyleDeclaration {
  return {
    getPropertyValue: (property: string) => values[property] ?? '',
  } as CSSStyleDeclaration;
}

function createTableWithContentUnits(
  units: Array<string | undefined>,
): PxTable {
  const contents: Variable = {
    id: 'contents',
    label: 'Contents',
    type: VartypeEnum.CONTENTS_VARIABLE,
    mandatory: true,
    values: units.map((unit, index) => ({
      code: `content-${index}`,
      label: `Content ${index}`,
      ...(unit === undefined
        ? {}
        : {
            contentInfo: {
              unit,
              decimals: 0,
              referencePeriod: '',
              basePeriod: '',
              alternativeText: '',
            },
          }),
    })),
  };

  return {
    metadata: { variables: [contents] },
  } as unknown as PxTable;
}

describe('getChartColorsFromCssVariables', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns undefined when window and document are unavailable', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('document', undefined);

    expect(getChartColorsFromCssVariables()).toBeUndefined();
  });

  it('parses csv colors and resolves referenced css variables', () => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn(() =>
        mockStyles({
          '--px-color-chart-series':
            ' var(--color-a), #00ff00, var(--color-b) ',
          '--color-a': ' #ff0000 ',
          '--color-b': ' var(--color-c) ',
          '--color-c': ' #0000ff ',
        }),
      ),
    );

    expect(getChartColorsFromCssVariables()).toEqual([
      '#ff0000',
      '#00ff00',
      '#0000ff',
    ]);
  });

  it('returns undefined when csv color list is empty', () => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn(() =>
        mockStyles({
          '--px-color-chart-series': ' ',
          '--px-color-chart-1': ' #111111 ',
          '--px-color-chart-2': ' var(--color-2) ',
          '--color-2': ' #222222 ',
          '--px-color-chart-3': '',
        }),
      ),
    );

    expect(getChartColorsFromCssVariables()).toBeUndefined();
  });

  it('returns undefined when no chart colors are configured', () => {
    vi.stubGlobal('document', { documentElement: {} });
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn(() =>
        mockStyles({
          '--px-color-chart-series': '',
          '--px-color-chart-1': '',
        }),
      ),
    );

    expect(getChartColorsFromCssVariables()).toBeUndefined();
  });
});

describe('getAdaptiveYAxisMin', () => {
  it('clamps to zero when the source range is non-negative', () => {
    expect(getAdaptiveYAxisMin({ min: 0, max: 1 })).toBe(0);
  });

  it('rounds down to a clean snap value for positive ranges', () => {
    expect(getAdaptiveYAxisMin({ min: 100, max: 200 })).toBe(50);
  });

  it('keeps negative ranges negative and rounds down', () => {
    expect(getAdaptiveYAxisMin({ min: -120, max: 80 })).toBe(-200);
  });
});

describe('getAdaptiveYAxisMax', () => {
  it('rounds up to a clean snap value for positive ranges', () => {
    expect(getAdaptiveYAxisMax({ min: 100, max: 200 })).toBe(250);
  });

  it('adds headroom and rounds up for small decimal ranges', () => {
    expect(getAdaptiveYAxisMax({ min: 0, max: 1 })).toBe(1.5);
  });

  it('works when min and max are equal', () => {
    expect(getAdaptiveYAxisMax({ min: 5, max: 5 })).toBe(5.5);
  });
});

describe('checkMultipleUnits', () => {
  it('returns false when there is no contents variable', () => {
    const table = {
      metadata: { variables: [] },
    } as unknown as PxTable;

    expect(checkMultipleUnits(table)).toBe(false);
  });

  it('returns false when fewer than two content values are selected', () => {
    expect(checkMultipleUnits(createTableWithContentUnits(['persons']))).toBe(
      false,
    );
  });

  it('returns false when fewer than two content values have units', () => {
    expect(
      checkMultipleUnits(createTableWithContentUnits(['persons', undefined])),
    ).toBe(false);
  });

  it('returns false when all defined content units match', () => {
    expect(
      checkMultipleUnits(createTableWithContentUnits(['persons', 'persons'])),
    ).toBe(false);
  });

  it('returns true when defined content units differ', () => {
    expect(
      checkMultipleUnits(createTableWithContentUnits(['persons', 'percent'])),
    ).toBe(true);
  });
});
