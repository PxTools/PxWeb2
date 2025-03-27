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
 * @returns formatted number
 *
 * This custom formatter is to be used in translation files, in the same way as the built-in
 * number formatter in i18next. But it also sets the rounding mode to the value of the variable
 * customRoundingMode, which should be read from a configuration file.
 */
export function pxNumber(
  value: number,
  lng: string | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (!options) {
    return new Intl.NumberFormat(lng, {
      roundingMode: customRoundingMode,
    }).format(value);
  }

  options.roundingMode = customRoundingMode;

  return new Intl.NumberFormat(lng, options).format(value);
}
