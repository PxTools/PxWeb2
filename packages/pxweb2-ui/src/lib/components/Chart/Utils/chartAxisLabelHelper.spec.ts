import { describe, expect, it } from 'vitest';

import {
  createResponsiveXAxisLabelConfig,
  wrapAxisName,
} from './chartAxisLabelHelper';

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

describe('createResponsiveXAxisLabelConfig', () => {
  it('leaves labels unwrapped when their rotated extent fits the height budget', () => {
    const config = createResponsiveXAxisLabelConfig(16);
    const label = 'Population by age group and region';
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toBe(label);
    expect(config.lineHeight).toBe(20);
  });

  it('formats primitive labels without coercing objects to strings', () => {
    const config = createResponsiveXAxisLabelConfig(16);
    const toString = vi.fn(() => 'object label');

    expect(config.formatter(2024)).toBe('2024');
    expect(config.formatter({ toString })).toBe('');
    expect(toString).not.toHaveBeenCalled();
  });

  it('wraps complete values only when their unwrapped extent exceeds the budget', () => {
    const config = createResponsiveXAxisLabelConfig(16);
    const label = 'A'.repeat(150);
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toContain('\n');
    expect(formattedLabel.replaceAll('\n', '')).toBe(label);
  });

  it('truncates labels that exceed the wrapped height budget', () => {
    const config = createResponsiveXAxisLabelConfig(16);
    const label = 'A'.repeat(2000);
    const formattedLabel = config.formatter(label);
    const maxLineCount = Math.floor(
      (265 - 32) / (config.lineHeight * Math.cos(Math.PI / 4)),
    );

    expect(formattedLabel).not.toBe('');
    expect(formattedLabel.endsWith('...')).toBe(true);
    expect(formattedLabel.split('\n').length).toBeLessThanOrEqual(maxLineCount);
    expect(formattedLabel.replaceAll('\n', '').length).toBeLessThan(
      label.length,
    );
  });

  it('allows fewer wrapped lines when the root font size is larger', () => {
    const standardSize = createResponsiveXAxisLabelConfig(16);
    const largerSize = createResponsiveXAxisLabelConfig(20);
    const label = 'A'.repeat(180);

    expect(standardSize.formatter(label)).not.toBe('');
    expect(largerSize.formatter(label)).toContain('...');
  });

  it('estimates the tallest formatted label and scales with root font size', () => {
    const standardSize = createResponsiveXAxisLabelConfig(16);
    const largerSize = createResponsiveXAxisLabelConfig(20);
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
