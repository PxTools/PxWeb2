import {
  mapCodeListToSelectOption,
  SelectedVBValues,
  SelectOption,
  Variable,
  PxTableMetadata,
} from '@pxweb2/pxweb2-ui';

export function updateSelectedCodelistForVariable(
  selectedItem: SelectOption,
  varId: string,
  prevSelectedValues: SelectedVBValues[],
  currentVariableMetadata: Variable,
  newTableMetadata: PxTableMetadata,
): SelectedVBValues[] | undefined {
  const currentSelectedVariable = prevSelectedValues.find(
    (variable) => variable.id === varId,
  );

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

  return applyMandatoryDefaultsForVariable(
    newSelectedValues,
    newTableMetadata,
    varId,
  );
}

function applyMandatoryDefaultsForVariable(
  selectedValues: SelectedVBValues[],
  metadata: PxTableMetadata,
  varId: string,
): SelectedVBValues[] {
  const newVariableMetadata = metadata.variables.find(
    (variable) => variable.id === varId,
  );

  // If the variable is not mandatory or has no metadata, return unchanged
  if (!newVariableMetadata?.mandatory) {
    return selectedValues;
  }

  // Apply mandatory default only to the specific variable
  return selectedValues.map((selectedVariable) => {
    if (selectedVariable.id === varId && selectedVariable.values.length === 0) {
      return {
        ...selectedVariable,
        values: [newVariableMetadata.values[0].code],
      };
    }
    return selectedVariable;
  });
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
