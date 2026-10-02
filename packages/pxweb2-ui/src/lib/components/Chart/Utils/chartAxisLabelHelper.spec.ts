import { describe, expect, it } from 'vitest';

import { createResponsiveXAxisLabelConfig } from './chartAxisLabelHelper';

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
