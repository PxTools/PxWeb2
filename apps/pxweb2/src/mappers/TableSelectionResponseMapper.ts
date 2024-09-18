import { SelectionResponse } from '@pxweb2/pxweb2-api-client';
import { SelectedVBValues } from '@pxweb2/pxweb2-ui';

export function mapTableSelectionResponse(
  response: SelectionResponse
): SelectedVBValues[] {
  // TODO:  Check if selection.selection is intended,
  // console.log('response i MAPPER=' + response.selection.selection[0].variableCode)
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
// console.log('selectedVBValues i MAPPER=' + selectedVBValues[1].values[0])
// console.log('selectedVBValues OBJ='+ JSON.stringify(selectedVBValues))
  return selectedVBValues;
}
