import { SelectionResponse } from '@pxweb2/pxweb2-api-client';
import { SelectedVBValues } from '@pxweb2/pxweb2-ui';

export function mapTableSelectionResponse(
  response: SelectionResponse,
): SelectedVBValues[] {
  const selectedVBValues: SelectedVBValues[] = response.selection.map(
    (variable) => {
      return {
        id: variable.variableCode,
        selectedCodeList: variable.codelist ? variable.codelist : undefined,
        values: variable.valueCodes ? variable.valueCodes : [],
      };
    },
  );
  return selectedVBValues;
}
