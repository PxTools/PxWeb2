import { CodeList } from '../shared-types/codelist';
import { SelectOption } from '../components/Select/Select';

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
