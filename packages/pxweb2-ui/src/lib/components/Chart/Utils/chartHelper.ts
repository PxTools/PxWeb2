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

export function getChartColorsFromCssVariables(): string[] | undefined {
  if (globalThis.window === undefined || globalThis.document === undefined) {
    return undefined;
  }

  const styles = getComputedStyle(globalThis.document.documentElement);

  const csvColorList = styles
    .getPropertyValue('--px-color-chart-series')
    .trim();

  if (csvColorList) {
    const parsedColors = csvColorList
      .split(',')
      .map((color) => resolveCssVariableValue(color, styles))
      .map((color) => color.trim())
      .filter(Boolean);

    if (parsedColors.length > 0) {
      return parsedColors;
    }
  }

  return undefined;
}
