import { describe, it, expect } from 'vitest';

import { pxNumber } from './formatters';

const NBSP = '\u00A0';
const NNBSP = '\u202F';

describe('pxNumber separator overrides for lang en', () => {
  const value = 12345.678; // ensure rounding path runs
  const lang = 'en';
  const baseOpts: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  it('uses locale default separators when no overrides', () => {
    const nf = new Intl.NumberFormat(lang, baseOpts);
    const expected = nf.format(value);
    const actual = pxNumber(value, lang, baseOpts);
    expect(actual).toBe(expected);
  });

  it('overrides thousand separator with NBSP (token: "nbsp")', () => {
    const nf = new Intl.NumberFormat(lang, baseOpts);
    const baseline = nf.format(value);
    const actual = pxNumber(value, lang, {
      ...baseOpts,
      thousandSeparator: 'nbsp',
    });

    const expected = baseline.split(',').join(NBSP);
    expect(actual).toBe(expected);
    expect(actual).toContain(NBSP);
    expect(actual).not.toContain(',');
  });

  it('overrides thousand separator with narrow NBSP (token: "nnbsp")', () => {
    const nf = new Intl.NumberFormat(lang, baseOpts);
    const baseline = nf.format(value);
    const actual = pxNumber(value, lang, {
      ...baseOpts,
      thousandSeparator: 'nnbsp',
    });

    const expected = baseline.split(',').join(NNBSP);
    expect(actual).toBe(expected);
    expect(actual).toContain(NNBSP);
    expect(actual).not.toContain(',');
  });

  it('overrides decimal separator only', () => {
    const nf = new Intl.NumberFormat(lang, baseOpts);
    const baseline = nf.format(value);
    const actual = pxNumber(value, lang, {
      ...baseOpts,
      decimalSeparator: ',',
    });

    const expected = baseline.replace('.', ',');
    expect(actual).toBe(expected);
  });

  it('overrides both thousand and decimal separators', () => {
    const nf = new Intl.NumberFormat(lang, baseOpts);
    const baseline = nf.format(value);
    const actual = pxNumber(value, lang, {
      ...baseOpts,
      thousandSeparator: 'nbsp',
      decimalSeparator: ',',
    });

    const expected = baseline.split(',').join(NBSP).replace('.', ',');
    expect(actual).toBe(expected);
    expect(actual).toContain(NBSP);
    expect(actual).toContain(',');
    expect(actual).not.toContain(',.'); // quick sanity guard for ",."
  });

  it('handles integers (no decimal part) with thousand override', () => {
    const intVal = 1234567;
    const nf = new Intl.NumberFormat(lang, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    const baseline = nf.format(intVal);
    const actual = pxNumber(intVal, lang, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      thousandSeparator: 'nbsp',
    });

    const expected = baseline.split(',').join(NBSP);
    expect(actual).toBe(expected);
    expect(actual).toContain(NBSP);
    expect(actual).not.toContain(',');
  });
});
