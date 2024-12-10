import { SelectionResponse } from '@pxweb2/pxweb2-api-client';
import { SelectedVBValues } from '@pxweb2/pxweb2-ui';

type VariableWithoutCodelist = Omit<SelectedVBValues, 'selectedCodeList'>;
type VariableWithCodelistValue = VariableWithoutCodelist & {
  selectedCodeList: string | undefined;
};

export function mapTableSelectionResponse(
  response: SelectionResponse,
): VariableWithCodelistValue[] {
  const selectedVBValues: VariableWithCodelistValue[] = response.selection.map(
    (variable) => {
      return {
        id: variable.variableCode,
        selectedCodeList: variable.codeList ? variable.codeList : undefined,
        values: variable.valueCodes ? variable.valueCodes : [],
      };
    },
  );
  return selectedVBValues;
}
