import { SavedQuery } from '@pxweb2/pxweb2-api-client';

export type SavedQueryCodeListType = {
  variableCode: string;
  values: string[];
  selectedCodeList?: string;
};
export function mapSavedQueryCodelistResponse(
  response: SavedQuery,
): SavedQueryCodeListType[] {
  const savedQueryCodeList: SavedQueryCodeListType[] =
    response.selection.selection.map((variable) => {
      return {
        variableCode: variable.variableCode,
        values: variable.valueCodes ?? [],
        selectedCodeList: variable.codeList ?? undefined,
      };
    });
  return savedQueryCodeList;
}
