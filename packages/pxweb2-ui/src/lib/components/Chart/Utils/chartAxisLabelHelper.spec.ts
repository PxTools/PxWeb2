import { describe, expect, it } from 'vitest';

import {
  createCategoryYAxisLabelConfig,
  createRotatedAxisLabelConfig,
  getAxisFontSize,
  getAxisLineHeight,
  getWrappedAxisNames,
  wrapAxisName,
} from './chartAxisLabelHelper';

function createXAxisConfig(pixelsPerRem: number) {
  const fontSize = getAxisFontSize(pixelsPerRem);
  return createRotatedAxisLabelConfig(fontSize, getAxisLineHeight(fontSize));
}

describe('wrapAxisName', () => {
  it('wraps at word boundaries when a line exceeds the maximum width', () => {
    const name = 'Population by region';
    const wrappedName = wrapAxisName(name, 120, 16);

    expect(wrappedName).toContain('\n');
    expect(wrappedName.replaceAll('\n', ' ')).toBe(name);
  });

  it('keeps a word intact when it is wider than the maximum width', () => {
    const name = 'Population';
    const wrappedName = wrapAxisName(name, 20, 16);

    expect(wrappedName).toBe(name);
  });

  it('wraps before a word that would exceed the maximum width', () => {
    const name = 'alpha beta gamma';
    const wrappedName = wrapAxisName(name, 65, 10);

    expect(wrappedName).toBe('alpha beta\ngamma');
    expect(wrappedName.replaceAll('\n', ' ')).toBe(name);
  });

  it('wraps more tightly when the font size increases', () => {
    const name = 'alpha beta gamma';
    const smallerFont = wrapAxisName(name, 65, 10);
    const largerFont = wrapAxisName(name, 65, 20);

    expect(largerFont.split('\n').length).toBeGreaterThan(
      smallerFont.split('\n').length,
    );
  });

  it('returns empty text for an empty name', () => {
    expect(wrapAxisName('  ', 50, 16)).toBe('');
  });
});

describe('getWrappedAxisNames', () => {
  it('uses the x-axis width for categories and y-axis width for values in vertical charts', () => {
    const name = 'alpha beta gamma delta';

    expect(getWrappedAxisNames(name, name, false, 10)).toEqual({
      wrappedCategoryAxisName: 'alpha beta gamma\ndelta',
      wrappedValueAxisName: name,
    });
  });

  it('swaps the widths for horizontal charts and respects the font size', () => {
    const name = 'alpha beta gamma delta';

    expect(getWrappedAxisNames(name, name, true, 10)).toEqual({
      wrappedCategoryAxisName: name,
      wrappedValueAxisName: 'alpha beta gamma\ndelta',
    });
    expect(getWrappedAxisNames(name, name, true, 20)).toEqual({
      wrappedCategoryAxisName: 'alpha beta gamma\ndelta',
      wrappedValueAxisName: 'alpha\nbeta\ngamma\ndelta',
    });
  });
});

describe('createCategoryYAxisLabelConfig', () => {
  it('wraps labels to the configured width and estimates their rendered width', () => {
    const config = createCategoryYAxisLabelConfig('xsmall', 16, 20);
    const label = 'A long category label';
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toContain('\n');
    expect(formattedLabel.replaceAll('\n', ' ')).toBe(label);
    expect(config.estimateWidth([label])).toBeLessThanOrEqual(100);
  });

  it('breaks long unspaced labels to fit the responsive width cap', () => {
    const config = createCategoryYAxisLabelConfig('xsmall', 16, 20);
    const label = 'A'.repeat(100);
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toContain('\n');
    expect(config.estimateWidth([label])).toBeLessThanOrEqual(100);
    expect(config.estimateHeight([label])).toBe(
      formattedLabel.split('\n').length * 20,
    );
  });

  it('preserves surrounding words when splitting a long word', () => {
    const config = createCategoryYAxisLabelConfig('xsmall', 16, 20);

    expect(config.formatter('hi abcdefgh lo')).toBe('hi abcdefgh\nlo');
  });
});

describe('createRotatedXAxisLabelConfig', () => {
  it('leaves labels unwrapped when their rotated extent fits the height budget', () => {
    const config = createXAxisConfig(16);
    const label = 'Population by age group and region';
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toBe(label);
  });

  it('formats primitive labels without coercing objects to strings', () => {
    const config = createXAxisConfig(16);
    const toString = vi.fn(() => 'object label');

    expect(config.formatter(2024)).toBe('2024');
    expect(config.formatter({ toString })).toBe('');
    expect(toString).not.toHaveBeenCalled();
  });

  it('formats numeric labels before wrapping when a number formatter is provided', () => {
    const config = createXAxisConfig(16);
    const numberFormatter = vi.fn(() => '1'.repeat(150));

    expect(config.formatter('1234.5', numberFormatter)).toBe(
      config.formatter('1'.repeat(150)),
    );
    expect(config.formatter(1234.5, numberFormatter)).toContain('\n');
    expect(numberFormatter).toHaveBeenCalledWith(1234.5);
    expect(config.formatter('  ', numberFormatter)).toBe('');
    expect(numberFormatter).toHaveBeenCalledTimes(2);
  });

  it('wraps complete values only when their unwrapped extent exceeds the budget', () => {
    const config = createXAxisConfig(16);
    const label = 'A'.repeat(150);
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toContain('\n');
    expect(formattedLabel.replaceAll('\n', '')).toBe(label);
  });

  it('truncates labels that exceed the wrapped height budget', () => {
    const config = createXAxisConfig(16);
    const label = 'A'.repeat(2000);
    const formattedLabel = config.formatter(label);
    const lineHeight = getAxisLineHeight(getAxisFontSize(16));
    const maxLineCount = Math.floor(
      (265 - 32) / (lineHeight * Math.cos(Math.PI / 4)),
    );

    expect(formattedLabel).not.toBe('');
    expect(formattedLabel.endsWith('...')).toBe(true);
    expect(formattedLabel.split('\n').length).toBeLessThanOrEqual(maxLineCount);
    expect(formattedLabel.replaceAll('\n', '').length).toBeLessThan(
      label.length,
    );
  });

  it('allows fewer wrapped lines when the root font size is larger', () => {
    const standardSize = createXAxisConfig(16);
    const largerSize = createXAxisConfig(20);
    const label = 'A'.repeat(180);

    expect(standardSize.formatter(label)).not.toBe('');
    expect(largerSize.formatter(label)).toContain('...');
  });

  it('estimates the tallest formatted label and scales with root font size', () => {
    const standardSize = createXAxisConfig(16);
    const largerSize = createXAxisConfig(20);
    const labels = ['2024', 'A'.repeat(150)];

    expect(standardSize.estimateHeight(labels)).toBeGreaterThan(
      standardSize.estimateHeight(['2024']),
    );
    expect(largerSize.estimateHeight(labels)).toBeGreaterThan(
      standardSize.estimateHeight(labels),
    );
    expect(standardSize.estimateHeight([])).toBe(0);
  });
});
