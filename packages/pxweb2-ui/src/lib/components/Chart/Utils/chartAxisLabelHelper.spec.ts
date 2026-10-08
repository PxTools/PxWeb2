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
    expect(config.lineHeight).toBeCloseTo(16.8);
  });

  it('wraps complete values only when their unwrapped extent exceeds the budget', () => {
    const config = createResponsiveXAxisLabelConfig(16);
    const label = 'A'.repeat(150);
    const formattedLabel = config.formatter(label);

    expect(formattedLabel).toContain('\n');
    expect(formattedLabel.replaceAll('\n', '')).toBe(label);
  });

  it('omits a complete label only when its wrapped height exceeds the budget', () => {
    const config = createResponsiveXAxisLabelConfig(16);
    const label = 'A'.repeat(2000);

    expect(config.formatter(label)).toBe('');
  });

  it('allows fewer wrapped lines when the root font size is larger', () => {
    const standardSize = createResponsiveXAxisLabelConfig(16);
    const largerSize = createResponsiveXAxisLabelConfig(20);
    const label = 'A'.repeat(400);

    expect(standardSize.formatter(label)).not.toBe('');
    expect(largerSize.formatter(label)).toBe('');
  });
});
