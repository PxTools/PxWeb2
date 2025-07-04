import { SavedQuery } from '@pxweb2/pxweb2-api-client';

export type SavedQueryCodeListType = {
  variableCode: string;
  selectedCodeList?: string;
};
export function mapSavedQueryCodelistResponse(
  response: SavedQuery,
): SavedQueryCodeListType[] {
  const savedQueryCodeList: SavedQueryCodeListType[] =
    response.selection.selection.map((variable) => {
      return {
        variableCode: variable.variableCode,
        selectedCodeList: variable.codeList ?? undefined,
      };
    });
  return savedQueryCodeList;
}
