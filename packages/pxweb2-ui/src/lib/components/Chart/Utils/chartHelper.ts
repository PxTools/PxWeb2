import { PxTable } from '../../../shared-types/pxTable';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';

function resolveCssVariableValue(
  value: string,
  styles: CSSStyleDeclaration,
  maxDepth = 10,
): string {
  let resolvedValue = value.trim();
  const cssVarPattern = new RegExp(/^var\((--[A-Za-z0-9-_]+)\)$/);

  for (let depth = 0; depth < maxDepth; depth += 1) {
    const match = cssVarPattern.exec(resolvedValue);
    if (!match) {
      break;
    }

    const variableValue = styles.getPropertyValue(match[1]).trim();
    if (!variableValue || variableValue === resolvedValue) {
      break;
    }

    resolvedValue = variableValue;
  }

  return resolvedValue;
}

type ChartCssValues = {
  chartColors: string[] | undefined;
  axisColor: string | undefined;
  fontColor: string | undefined;
};
export function getChartCssVariables(): ChartCssValues | undefined {
  if (globalThis.window === undefined || globalThis.document === undefined) {
    return undefined;
  }

  const styles = getComputedStyle(globalThis.document.documentElement);
  const csvColorList = styles
    .getPropertyValue('--px-color-chart-series')
    .trim();
  let parsedColors: string[] = [];

  if (csvColorList) {
    parsedColors = csvColorList
      .split(',')
      .map((color) => resolveCssVariableValue(color, styles))
      .map((color) => color.trim())
      .filter(Boolean);
  }

  const axisColor = styles.getPropertyValue('--px-color-border-default').trim();
  const fontColor = styles.getPropertyValue('--px-color-text-default').trim();

  return {
    chartColors: parsedColors.length > 0 ? parsedColors : undefined,
    axisColor: axisColor
      ? resolveCssVariableValue(axisColor, styles)
      : undefined,
    fontColor: fontColor
      ? resolveCssVariableValue(fontColor, styles)
      : undefined,
  };
}

/**
 * Rounds a positive number up to a nearby convenient value, such as 2, 5, or
 * 10, to make chart-axis labels easier to read. Non-positive or non-finite
 * values use `1` as a safe default.
 *
 * @param value - The number to round.
 * @returns A convenient rounded number, or `1` when the input is invalid or
 *   not positive.
 */
function getNiceNumber(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  const exponent = Math.floor(Math.log10(value));
  const base = 10 ** exponent;
  const fraction = value / base;

  if (fraction <= 1) {
    return 1 * base;
  }
  if (fraction <= 2) {
    return 2 * base;
  }
  if (fraction <= 5) {
    return 5 * base;
  }
  return 10 * base;
}

/**
 * Chooses a convenient rounding step based on the size of the data range.
 * A zero-based axis uses a smaller step so it can show more intervals.
 *
 * @param min - The lower bound of the range used to calculate the step.
 * @param max - The upper bound of the range used to calculate the step.
 * @param zeroBased - Whether the axis starts at zero; defaults to `false`.
 * @returns A rounded step size suitable for axis limits or tick marks.
 */
function getAdaptiveSnapUnit(
  min: number,
  max: number,
  zeroBased = false,
): number {
  const span = Math.max(max - min, 1);

  return getNiceNumber(span / (zeroBased ? 6 : 3));
}

const Y_AXIS_BREAK_GAP = '13%';

/**
 * Calculates a readable lower limit for the y-axis by adding a small margin
 * below the smallest data value and rounding down to a convenient step.
 * When all values are non-negative, the limit will not go below zero.
 *
 * @param value - The data range, with `min` as its lowest value and `max` as
 *   its highest value.
 * @returns The rounded lower limit to use for the y-axis.
 */
export function getAdaptiveYAxisMin(value: {
  min: number;
  max: number;
}): number {
  const min = Number(value.min);
  const max = Number(value.max);
  const span = Math.max(max - min, 1);
  const pad = span * 0.03;
  const snap = getAdaptiveSnapUnit(min, max);
  const paddedMin = min - pad;
  const roundedMin = Math.floor(paddedMin / snap) * snap;

  // Keep non-negative axes non-negative.
  if (min >= 0) {
    return Math.max(0, roundedMin);
  }
  return roundedMin;
}

/**
 * Calculates a readable upper limit for the y-axis by adding a small margin
 * above the largest data value and rounding it up to a convenient step.
 *
 * @param value - The data range, with `min` as its lowest value and `max` as
 *   its highest value.
 * @param zeroBased - Whether to calculate the range as starting at zero when
 *   all data values are non-negative.
 * @returns The rounded upper limit to use for the y-axis.
 */
export function getAdaptiveYAxisMax(
  value: {
    min: number;
    max: number;
  },
  zeroBased: boolean,
): number {
  const valueMin = Number(value.min);
  const min = zeroBased && valueMin >= 0 ? 0 : valueMin;
  const max = Number(value.max);
  const span = Math.max(max - min, 1);
  const pad = span * 0.03;
  const snap = getAdaptiveSnapUnit(min, max, zeroBased);
  const paddedMax = max + pad;
  return Math.ceil(paddedMax / snap) * snap;
}

/**
 * Chooses a clean interval for y-axis tick marks based on the data range.
 * The interval is rounded to a convenient value so the axis is easier to read.
 *
 * @param value - The data range, with `min` as its lowest value and `max` as
 *   its highest value.
 * @returns The numeric distance between consecutive y-axis tick marks.
 */
export function getAdaptiveYAxisInterval(value: {
  min: number;
  max: number;
}): number {
  const min = Number(value.min);
  const max = Number(value.max);

  return getAdaptiveSnapUnit(min, max);
}

/**
 * Creates a visual break on the y-axis when all values are positive and the
 * adaptive axis minimum is above zero. The break skips the empty range between
 * zero and that minimum so the chart can focus on the data.
 *
 * @param value - The data range, with `min` as its lowest value and `max` as
 *   its highest value.
 * @returns The break range (`start` and `end`) and its visual gap size, or
 *   `undefined` when a break is not appropriate.
 */
export function getYAxisBreak(value: {
  min: number;
  max: number;
}): { start: number; end: number; gap: string } | undefined {
  const lowestValue = Number(value.min);
  const highestValue = Number(value.max);
  if (!Number.isFinite(lowestValue) || lowestValue <= 0) {
    return undefined;
  }

  const adaptiveMin = getAdaptiveYAxisMin({
    min: lowestValue,
    max: highestValue,
  });

  if (adaptiveMin <= 0) {
    return undefined;
  }

  return {
    start: 0,
    end: adaptiveMin,
    gap: Y_AXIS_BREAK_GAP,
  };
}

// Check if the contents variable has multiple units selected.
// If so, we cannot display the chart since the y-axis will be ambiguous.
export function checkMultipleUnits(pxtable: PxTable): boolean {
  const contentsVariable = pxtable.metadata.variables.find(
    (variable) => variable.type === VartypeEnum.CONTENTS_VARIABLE,
  );

  if (!contentsVariable || contentsVariable.values.length < 2) {
    return false;
  }

  const units = contentsVariable.values
    .map((value) => value.contentInfo?.unit)
    .filter((unit): unit is NonNullable<typeof unit> => unit !== undefined);

  if (units.length < 2) {
    return false;
  }

  return units.some((unit) => unit !== units[0]);
}
