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

describe('pxNumber decimal digits and rounding ', () => {
  const value = 12345.675;
  const lang = 'en';

  //pxNumber uses halfExpand - round away from zero
  it('pxNumber format to 1 digit', () => {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    };
    const expected = '12,345.7';
    const actual = pxNumber(value, lang, options);
    expect(actual).toBe(expected);
  });

  it('pxNumber format to 2 digit', () => {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };
    const expected = '12,345.68';
    const actual = pxNumber(value, lang, options);
    expect(actual).toBe(expected);
  });

  it('pxNumber format to 3 digit', () => {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    };
    const expected = '12,345.675';
    const actual = pxNumber(value, lang, options);
    expect(actual).toBe(expected);
  });

  it('pxNumber overrides passed roundingmode option', () => {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'halfFloor',
    };
    const expectedHalfFloor = '12,345.67';
    const expectedHalfExpand = '12,345.68';

    const nf = new Intl.NumberFormat(lang, options);
    const defaultFormat = nf.format(value);
    const pxNumberFormat = pxNumber(value, lang, options);

    expect(defaultFormat).toBe(expectedHalfFloor);
    expect(pxNumberFormat).toBe(expectedHalfExpand);
  });

  it('pxNumber roundingmode is halfExpand', () => {
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    };

    const optionsHalfExpand: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      roundingMode: 'halfExpand',
    };

    const nf = new Intl.NumberFormat(lang, optionsHalfExpand);
    const defaultFormatWithHalfExpand = nf.format(value);
    const pxNumberFormat = pxNumber(value, lang, options);

    expect(pxNumberFormat).toBe(defaultFormatWithHalfExpand);
  });
});
