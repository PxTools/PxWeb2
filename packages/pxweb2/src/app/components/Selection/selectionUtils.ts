import {
  mapCodeListToSelectOption,
  SelectedVBValues,
  SelectOption,
  Variable,
} from '@pxweb2/pxweb2-ui';

export function updateSelectedCodelistForVariable(
  selectedItem: SelectOption | undefined,
  varId: string,
  prevSelectedValues: SelectedVBValues[],
  currentVariableMetadata: Variable,
): SelectedVBValues[] | undefined {
  const currentSelectedVariable = prevSelectedValues.find(
    (variable) => variable.id === varId,
  );
  const currentCodeList = currentSelectedVariable?.selectedCodeList;

  // No new selection made, do nothing
  if (!selectedItem || selectedItem.value === currentCodeList) {
    return;
  }

  const newSelectedCodeList = currentVariableMetadata?.codeLists?.find(
    (codelist) => codelist.id === selectedItem.value,
  );

  if (!newSelectedCodeList) {
    return;
  }

  const newMappedSelectedCodeList =
    mapCodeListToSelectOption(newSelectedCodeList);

  const newSelectedValues = addSelectedCodeListToVariable(
    currentSelectedVariable,
    prevSelectedValues,
    varId,
    newMappedSelectedCodeList,
  );

  return newSelectedValues;
}

export function addSelectedCodeListToVariable(
  currentVariable: SelectedVBValues | undefined,
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  selectedItem: SelectOption,
): SelectedVBValues[] {
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        return {
          ...variable,
          selectedCodeList: selectedItem.value,
          values: [], // Always reset values when changing codelist
        };
      }

      return variable;
    });
  }
  if (!currentVariable) {
    newSelectedValues = [
      ...selectedValuesArr,
      {
        id: varId,
        selectedCodeList: selectedItem.value,
        values: [],
      },
    ];
  }

  return newSelectedValues;
}

export function getSelectedCodelists(
  prevSelectedValues: SelectedVBValues[],
  selectedItem: SelectOption | undefined,
  varId: string,
): Record<string, string> {
  // Get table metadata in the new codelist context
  // Collect selected codelists for all variables, including the newly selected one
  const selectedCodeLists: Record<string, string> = {};

  // Add existing selected codelists
  prevSelectedValues.forEach((variable) => {
    if (variable.selectedCodeList) {
      selectedCodeLists[variable.id] = variable.selectedCodeList;
    }
  });

  // Add/overwrite with the newly selected codelist for this variable
  // selectedCodeLists[varId] = newMappedSelectedCodeList.value;
  if (selectedItem) {
    selectedCodeLists[varId] = selectedItem.value;
  }

  return selectedCodeLists;
}
