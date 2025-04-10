import { CodeList } from '../shared-types/codelist';
import { SelectOption } from '../components/Select/SelectOptionType';
import { IconProps } from '../components/Icon/Icon';

export const getCSSVariable = (variable: string): string => {
  const rootStyle = getComputedStyle(document.documentElement);
  const cssVar = rootStyle.getPropertyValue(variable).trim(); // Remove whitespace at beginning of string
  return cssVar;
};

export const mapCodeListToSelectOption = (codeList: CodeList): SelectOption => {
  return {
    label: codeList.label,
    value: codeList.id,
  };
};

// return array of SelectOption objects
export const mapCodeListsToSelectOptions = (
  codeList: CodeList[],
): SelectOption[] => {
  return codeList.map((code) => ({
    label: code.label,
    value: code.id,
  }));
};

/**
 * Returns the icon direction based on the RTL setting.
 *
 * @param isRtl - A boolean indicating whether the layout is RTL (right-to-left).
 * @param iconLeft - The icon to use for left-to-right layout.
 * @param iconRight - The icon to use for right-to-left layout.
 * @returns The icon direction as a string.
 */
export function getIconDirection(
  langDir: 'ltr' | 'rtl',
  iconForLtl: IconProps['iconName'],
  iconForRtl: IconProps['iconName'],
): IconProps['iconName'] {
  const isRtl = langDir === 'rtl';

  return isRtl ? iconForRtl : iconForLtl;
}
