import { SelectOption } from '../Select/SelectOptionType';
import { Codelist } from '../../shared-types/codelist';
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
  codelists: Codelist[] | undefined,
): SelectOption[] => {
  if (!codelists || codelists.length === 0) {
    return [];
  }

  const needsSorting =
    codelists.some((codelist) => codelist.id.toLowerCase().startsWith('vs_')) &&
    codelists.some((codelist) => codelist.id.toLowerCase().startsWith('agg_'));
  const mappedCodeLists = mapCodeListsToSelectOptions(codelists);

  if (needsSorting) {
    return sortSelectOptionsGroupingsLast(mappedCodeLists);
  }

  return mappedCodeLists;
};
