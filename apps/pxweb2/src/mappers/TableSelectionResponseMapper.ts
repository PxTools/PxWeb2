import { SelectionResponse } from '@pxweb2/pxweb2-api-client';
import { SelectedVBValues } from '@pxweb2/pxweb2-ui';

export function mapTableSelectionResponse(
  response: SelectionResponse
): SelectedVBValues[] {
  // TODO:  Check if selection.selection is intended,
  const selectedVBValues: SelectedVBValues[] = response.selection.selection.map(
    (variable) => {
      return {
        id: variable.variableCode,

        // TODO: Not ready in the API yet, implement when ready
        //       handleCodeListChange in app.tsx probably needs to be refactored for this to work optimally
        selectedCodeList: undefined,
        values: variable.valueCodes ? variable.valueCodes : [],
      };
    }
  );
  return selectedVBValues;
}
