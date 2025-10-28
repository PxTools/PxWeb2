import { useTranslation } from 'react-i18next';

const customRoundingMode = 'halfExpand';

/*
 * Custom number formatter
 * @param value - number to format
 * @param decimals - number of decimals, or minimum number of decimals if maxDecimals is set
 * @param maxDecimals - maximum number of decimals
 * @returns formatted number
 *
 * Example usage:
 * NumberFormatter(2000.6666666, 2)
 * NumberFormatter(2000.6666666, 2, 4)
 *
 * This can be used to format a number, and could be easier to use than
 * the built-in number formatter in i18next when dealing with a large
 * amount of numbers.
 *
 * It also set the rounding mode to the value of the variable customRoundingMode,
 * which should be read from a configuration file.
 */
export function NumberFormatter(
  value: number,
  decimals: number,
  maxDecimals?: number,
): string {
  const { i18n } = useTranslation();
  const max = maxDecimals ? maxDecimals : decimals;

  const nf = new Intl.NumberFormat(i18n.resolvedLanguage, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: max,
    roundingMode: customRoundingMode,
  });

  return nf.format(value);
}

/*
 * Custom number formatter
 * @param value - number to format
 * @param lng - language
 * @param options - number format options
 *   - thousandSeparator?: string - optional override for grouping separator
 *   - decimalSeparator?: string  - optional override for decimal separator
 * @returns formatted number
 *
 * This custom formatter is to be used in translation files, in the same way as the built-in
 * number formatter in i18next. But it also sets the rounding mode to the value of the variable
 * customRoundingMode, which should be read from a configuration file.
 */
export function pxNumber(
  value: number,
  lng: string | undefined,
  options?: Intl.NumberFormatOptions & {
    thousandSeparator?: string;
    decimalSeparator?: string;
  },
): string {
  const { thousandSeparator, decimalSeparator, ...intlOptions } = options ?? {};

  (intlOptions as Intl.NumberFormatOptions).roundingMode = customRoundingMode;

  const nf = new Intl.NumberFormat(lng, intlOptions);
  if (thousandSeparator === undefined && decimalSeparator === undefined) {
    return nf.format(value);
  }

  const group = normalizeSeparator(thousandSeparator);
  const dec = normalizeSeparator(decimalSeparator);

  if (group === undefined && dec === undefined) {
    return nf.format(value);
  }

  // Format to parts to override separators
  const parts = nf.formatToParts(value);

  let formattedOutput = '';
  for (const p of parts) {
    if (p.type === 'group' && group !== undefined) {
      formattedOutput += group;
    } else if (p.type === 'decimal' && dec !== undefined) {
      formattedOutput += dec;
    } else {
      formattedOutput += p.value;
    }
  }
  return formattedOutput;
}

function normalizeSeparator(raw?: string): string | undefined {
  if (raw == null) {
    return undefined;
  }
  const key = raw.trim().toLowerCase();
  if (key === 'nbsp') {
    return '\u00A0';
  }
  if (key === 'nnbsp') {
    return '\u202F';
  }

  return raw;
}
