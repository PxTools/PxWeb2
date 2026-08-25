import { afterEach, describe, expect, it, vi } from 'vitest';

import { getChartCssVariables } from './chartHelper';

function mockStyles(values: Record<string, string>): CSSStyleDeclaration {
  return {
    getPropertyValue: (property: string) => values[property] ?? '',
  } as CSSStyleDeclaration;
}

describe('getChartCssVariables', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns undefined when document is unavailable', () => {
    vi.stubGlobal('document', undefined);

    expect(getChartCssVariables()?.chartColors).toBeUndefined();
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

    expect(getChartCssVariables()?.chartColors).toEqual([
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

    expect(getChartCssVariables()?.chartColors).toBeUndefined();
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

    expect(getChartCssVariables()?.chartColors).toBeUndefined();
  });
});
