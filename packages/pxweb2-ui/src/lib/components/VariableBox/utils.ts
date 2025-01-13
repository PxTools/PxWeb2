import { SelectOption } from '../Select/Select';
import { CodeList } from '../../shared-types/codelist';
import { mapCodeListsToSelectOptions } from '../../util/util';

export const sortSelectOptionsGroupingsLast = (
  options: SelectOption[],
): SelectOption[] => {
  if (options.length < 1) {
    return [];
  }

  // if value starts with "vs_", put them at the top
  const vsOptions = options.filter((option) => option.value.startsWith('vs_'));
  const otherOptions = options.filter(
    (option) => !option.value.startsWith('vs_'),
  );

  return [...vsOptions, ...otherOptions];
};

export const mapAndSortCodeLists = (
  codeLists: CodeList[] | undefined,
): SelectOption[] => {
  if (!codeLists || codeLists.length === 0) {
    return [];
  }

  const needsSorting =
    codeLists.some((codeList) => codeList.id.toLowerCase().startsWith('vs_')) &&
    codeLists.some((codeList) => codeList.id.toLowerCase().startsWith('agg_'));
  const mappedCodeLists = mapCodeListsToSelectOptions(codeLists);

  if (needsSorting) {
    return sortSelectOptionsGroupingsLast(mappedCodeLists);
  }

  return mappedCodeLists;
};
