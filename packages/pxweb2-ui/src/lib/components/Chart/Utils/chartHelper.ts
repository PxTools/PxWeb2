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

function getAdaptiveSnapUnit(min: number, max: number): number {
  const span = Math.max(max - min, 1);

  // No fixed tick count: just derive a clean rounding grain from data span.
  // For spans around 1.3M this typically becomes 500k.
  return getNiceNumber(span / 3);
}

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

export function getAdaptiveYAxisMax(value: {
  min: number;
  max: number;
}): number {
  const min = Number(value.min);
  const max = Number(value.max);

  const span = Math.max(max - min, 1);
  const pad = span * 0.03;
  const snap = getAdaptiveSnapUnit(min, max);

  const paddedMax = max + pad;
  return Math.ceil(paddedMax / snap) * snap;
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
