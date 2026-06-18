import { describe, expect, it, vi } from 'vitest';

import { applyTableCardTitleTransform } from './tableCardTitleTransform';

vi.mock('./config/getConfig', () => ({
  getConfig: vi.fn(() => ({})),
}));

describe('applyTableCardTitleTransform', () => {
  it('returns original title when transform config is missing', () => {
    expect(applyTableCardTitleTransform('1234: Example title')).toBe(
      '1234: Example title',
    );
  });

  it('applies regex replacement from config', () => {
    const result = applyTableCardTitleTransform('1234: Example title', {
      pattern: String.raw`^\d+:\s*`,
      replacement: '',
    });

    expect(result).toBe('Example title');
  });

  it('supports regex flags from config', () => {
    const result = applyTableCardTitleTransform('ABC test abc test', {
      pattern: 'abc',
      flags: 'gi',
      replacement: 'X',
    });

    expect(result).toBe('X test X test');
  });

  it('returns original title when regex is invalid', () => {
    const result = applyTableCardTitleTransform('Title', {
      pattern: '[',
      replacement: '',
    });

    expect(result).toBe('Title');
  });
});
