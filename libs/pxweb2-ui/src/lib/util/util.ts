export const getCSSVariable = (variable: string): string => {
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVar = rootStyle.getPropertyValue(variable).trim(); // Remove whitespace at beginning of string
  return cssVar;
};
