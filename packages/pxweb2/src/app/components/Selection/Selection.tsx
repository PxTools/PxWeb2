import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import { ApiError, TableService } from '@pxweb2/pxweb2-api-client';
import { mapJsonStat2Response } from '../../../mappers/JsonStat2ResponseMapper';
import { mapTableSelectionResponse } from '../../../mappers/TableSelectionResponseMapper';
import {
  PxTableMetadata,
  SelectedVBValues,
  VariableList,
  Value,
  SelectOption,
  mapCodeListToSelectOption,
  PxTable,
  ValueDisplayType,
  Variable,
  CodeList,
} from '@pxweb2/pxweb2-ui';
import NavigationDrawer from '../../components/NavigationDrawer/NavigationDrawer';
import useVariables from '../../context/useVariables';
import { NavigationItem } from '../../components/NavigationMenu/NavigationItem/NavigationItemType';
import useAccessibility from '../../context/useAccessibility';
import { getLabelText } from '../../util/utils';
import { problemMessage } from '../../util/problemMessage';

function addSelectedCodeListToVariable(
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

function addValueToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code'],
) {
  const newSelectedValues = selectedValuesArr.map((variable) => {
    if (variable.id === varId) {
      variable.values = [...variable.values, value];
    }

    return variable;
  });

  return newSelectedValues;
}

function addValueToNewVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code'],
) {
  const newSelectedValues = [
    ...selectedValuesArr,
    { id: varId, selectedCodeList: undefined, values: [value] },
  ];

  return newSelectedValues;
}

// Get the selected codelist from the API
export async function getCodeList(
  id: string,
  lang: string,
  valueDisplayType: ValueDisplayType,
): Promise<CodeList> {
  let codelist: CodeList = {
    id: id,
    label: '',
    values: [],
    mandatory: false,
  };

  await TableService.getTableCodeListById(id, lang)
    .then((response) => {
      codelist.label = response.label;
      codelist.mandatory = !response.elimination;
      response.values.forEach((value) => {
        codelist.values = [
          ...codelist.values,
          {
            code: value.code,

            // Set the label text based on the value display type
            label: getLabelText(valueDisplayType, value.code, value.label),
          },
        ];
      });
    })
    .catch((error) => {
      throw new Error('Could not get codelist: ' + id + ' ' + error);
    });

  return codelist;
}

function removeValueOfVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code'],
) {
  const newSelectedValues = selectedValuesArr
    .map((variable) => {
      if (variable.id === varId) {
        const hasMultipleValuesSelected = variable.values.length > 1;

        if (
          hasMultipleValuesSelected ||
          (!hasMultipleValuesSelected &&
            variable.selectedCodeList !== undefined)
        ) {
          variable.values = variable.values.filter((val) => val !== value);
        }
        if (
          !hasMultipleValuesSelected &&
          variable.selectedCodeList === undefined
        ) {
          return null;
        }
      }

      return variable;
    })
    .filter((value) => value !== null) as SelectedVBValues[];

  return newSelectedValues;
}

function addMultipleValuesToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  valuesToAdd: Value[],
  searchedValues: Value[],
): SelectedVBValues[] {
  const currentVariable = selectedValuesArr.find(
    (variable) => variable.id === varId,
  );
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        const prevValues = [...variable.values];
        const valuesList = valuesToAdd
          .filter(
            (v) => prevValues.includes(v.code) || searchedValues.includes(v),
          )
          .map((value) => value.code);
        variable.values = valuesList;
      }
      return variable;
    });
  }
  if (!currentVariable) {
    newSelectedValues = [
      ...selectedValuesArr,
      {
        id: varId,
        selectedCodeList: undefined,
        values: valuesToAdd
          .filter((v) => searchedValues.includes(v))
          .map((value) => value.code),
      },
    ];
  }

  return newSelectedValues;
}

function removeMultipleValuesToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  valuesToAdd: Value[],
  searchedValues: Value[],
): SelectedVBValues[] {
  const currentVariable = selectedValuesArr.find(
    (variable) => variable.id === varId,
  );
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        const prevValues = [...variable.values];
        const valuesList = prevValues.filter(
          (val) => !searchedValues.some((v) => v.code === val),
        );
        variable.values = valuesList;
      }
      return variable;
    });
  }
  if (!currentVariable) {
    newSelectedValues = [
      ...selectedValuesArr,
      {
        id: varId,
        selectedCodeList: undefined,
        values: valuesToAdd
          .filter((v) => searchedValues.includes(v))
          .map((value) => value.code),
      },
    ];
  }

  return newSelectedValues;
}

function removeAllValuesOfVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
): SelectedVBValues[] {
  const newValues: SelectedVBValues[] = selectedValuesArr
    .map((variable) => {
      if (variable.id === varId) {
        if (variable.selectedCodeList !== undefined) {
          return {
            id: varId,
            selectedCodeList: variable.selectedCodeList,
            values: [],
          };
        }
        if (variable.selectedCodeList === undefined) {
          return null;
        }
      }

      return variable;
    })
    .filter((value) => value !== null) as SelectedVBValues[];

  return newValues;
}

interface VariableWithDisplayType extends Variable {
  valueDisplayType: ValueDisplayType;
}

type propsType = {
  selectedNavigationView: string;
  selectedTabId: string;
  openedWithKeyboard: boolean;
  setSelectedNavigationView: (
    keyboard: boolean,
    close: boolean,
    view: NavigationItem,
  ) => void;
  hideMenuRef?: React.RefObject<HTMLDivElement | null>;
};

export function Selection({
  selectedNavigationView,
  selectedTabId,
  openedWithKeyboard,
  setSelectedNavigationView,
  hideMenuRef,
}: propsType) {
  const { selectedVBValues, setSelectedVBValues } = useVariables();
  const variables = useVariables();
  const [errorMsg, setErrorMsg] = useState('');
  const { i18n, t } = useTranslation();
  const { hasLoadedDefaultSelection } = useVariables();
  const { isLoadingMetadata } = useVariables();
  const { pxTableMetadata, setPxTableMetadata } = useVariables();
  const [pxTableMetaToRender, setPxTableMetaToRender] =
    // Metadata to render in the UI
    useState<PxTableMetadata | null>(null);
  const [prevTableId, setPrevTableId] = useState('');
  const [isFadingVariableList, setIsFadingVariableList] = useState(false);

  //  Needed to know when the language has changed, so we can reload the default selection
  const [prevLang, setPrevLang] = useState('');
  const { addModal, removeModal } = useAccessibility();

  useEffect(() => {
    if (errorMsg) {
      console.error('ERROR: Selection:', errorMsg);
      throw Error(errorMsg);
    }
  }, [errorMsg]);

  useEffect(() => {
    let shouldGetDefaultSelection = !hasLoadedDefaultSelection;

    if (!selectedTabId) {
      return;
    }

    //  If the table has changed, or the language has changed, we need to reload the default selection
    if (
      prevTableId === '' ||
      prevTableId !== selectedTabId ||
      prevLang !== i18n.resolvedLanguage
    ) {
      variables.setHasLoadedDefaultSelection(false);
      shouldGetDefaultSelection = true;
      setPrevTableId(selectedTabId);
      setPrevLang(i18n.resolvedLanguage || '');
    }

    if (isLoadingMetadata === false) {
      variables.setIsLoadingMetadata(true);
    }

    const metaDataDefaultSelection = true;

    TableService.getMetadataById(
      selectedTabId,
      i18n.resolvedLanguage,
      metaDataDefaultSelection,
    )
      .then((Dataset) => {
        const pxTable: PxTable = mapJsonStat2Response(Dataset, false);

        setPxTableMetadata(pxTable.metadata);
        if (pxTableMetaToRender !== null) {
          setPxTableMetaToRender(null);
        }
        setErrorMsg('');
      })
      .then(() => {
        if (!shouldGetDefaultSelection) {
          variables.setIsLoadingMetadata(false);
        }
      })
      .catch((apiError: ApiError) => {
        setErrorMsg(problemMessage(apiError, selectedTabId));
        setPxTableMetadata(null);
      })
      .catch((error) => {
        setErrorMsg(`Could not get table: ${selectedTabId} ${error.message}`);
        setPxTableMetadata(null);
      });

    if (shouldGetDefaultSelection) {
      TableService.getDefaultSelection(selectedTabId, i18n.resolvedLanguage)
        .then((selectionResponse) => {
          const defaultSelection = mapTableSelectionResponse(
            selectionResponse,
          ).filter(
            (variable) =>
              variable.values.length > 0 ||
              variable.selectedCodeList !== undefined,
          );
          setSelectedVBValues(defaultSelection);
          variables.syncVariablesAndValues(defaultSelection);
          variables.setIsLoadingMetadata(false);
          variables.setHasLoadedDefaultSelection(true);
        })
        .catch((apiError: ApiError) => {
          setErrorMsg(problemMessage(apiError, selectedTabId));
        })
        .catch((error) => {
          setErrorMsg(
            `Error getting default selection: ${selectedTabId} ${error.message}`,
          );
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabId, i18n.resolvedLanguage]);

  if (pxTableMetaToRender === null && pxTableMetadata !== null) {
    setPxTableMetaToRender(structuredClone(pxTableMetadata));
  }

  async function handleCodeListChange(
    selectedItem: SelectOption | undefined,
    varId: string,
  ) {
    const prevSelectedValues = structuredClone(selectedVBValues);
    const currentVariableMetadata = pxTableMetaToRender?.variables.find(
      (variable) => variable.id === varId,
    ) as VariableWithDisplayType;
    const currentSelectedVariable = prevSelectedValues.find(
      (variable) => variable.id === varId,
    );
    const lang = i18n.resolvedLanguage;

    // No language, do nothing
    if (lang === undefined) {
      return;
    }
    const currentCodeList = currentSelectedVariable?.selectedCodeList;

    // No new selection made, do nothing
    if (!selectedItem || selectedItem.value === currentCodeList) {
      return;
    }

    if (pxTableMetaToRender === null || currentVariableMetadata === undefined) {
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

    setIsFadingVariableList(true);

    //  Get the selected codelist
    const newCodelist: CodeList = await getCodeList(
      newMappedSelectedCodeList.value,
      lang,
      currentVariableMetadata.valueDisplayType,
    )
      .finally(() => {
        setIsFadingVariableList(false);
      })
      .catch((apiError: ApiError) => {
        setErrorMsg(problemMessage(apiError, selectedTabId));
        return {
          id: '',
          label: '',
          values: [],
          mandatory: false,
        };
      })
      .catch((error) => {
        console.error(
          `Could not get values for code list: ${newMappedSelectedCodeList.value} ${error}`,
        );
        return {
          id: '',
          label: '',
          values: [],
          mandatory: false,
        };
      });

    // Update variable mandatory according to the new codelist
    if (
      newCodelist.mandatory != undefined &&
      newCodelist.mandatory != currentVariableMetadata.mandatory
    ) {
      currentVariableMetadata.mandatory = newCodelist.mandatory;
    }

    if (newCodelist.values.length < 1) {
      return;
    }

    const newPxTableMetaToRender: PxTableMetadata =
      structuredClone(pxTableMetaToRender);
    newPxTableMetaToRender.variables.forEach((variable) => {
      if (!variable.codeLists) {
        return;
      }

      variable.codeLists.forEach((codelist) => {
        if (codelist.id !== newMappedSelectedCodeList.value) {
          return;
        }

        for (let i = 0; i < newPxTableMetaToRender.variables.length - 1; i++) {
          if (newPxTableMetaToRender.variables[i].id !== variable.id) {
            continue;
          }

          newPxTableMetaToRender.variables[i].values = newCodelist.values;
        }
      });
    });

    // update the state
    updateAndSyncVBValues(newSelectedValues);
    setPxTableMetadata(newPxTableMetaToRender);
    setPxTableMetaToRender(null);
  }

  const handleCheckboxChange = (varId: string, value: Value['code']) => {
    const prevSelectedValues = structuredClone(selectedVBValues);
    const hasVariable =
      selectedVBValues.findIndex((variables) => variables.id === varId) !== -1;
    const hasValue = selectedVBValues
      .find((variables) => variables.id === varId)
      ?.values.includes(value);

    if (hasVariable && hasValue) {
      const newSelectedValues = removeValueOfVariable(
        prevSelectedValues,
        varId,
        value,
      );

      updateAndSyncVBValues(newSelectedValues);
    }
    if (hasVariable && !hasValue) {
      const newSelectedValues = addValueToVariable(
        prevSelectedValues,
        varId,
        value,
      );

      updateAndSyncVBValues(newSelectedValues);
    }
    if (!hasVariable) {
      const newSelectedValues = addValueToNewVariable(
        prevSelectedValues,
        varId,
        value,
      );

      updateAndSyncVBValues(newSelectedValues);
    }
  };

  const handleMixedCheckboxChange = (
    varId: string,
    allValuesSelected: string,
    searchValues: Value[],
  ) => {
    const prevSelectedValues = structuredClone(selectedVBValues);

    if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
      const allValuesOfVariable =
        pxTableMetaToRender?.variables.find((variable) => variable.id === varId)
          ?.values || [];
      const newSelectedValues = addMultipleValuesToVariable(
        prevSelectedValues,
        varId,
        allValuesOfVariable,
        searchValues,
      );
      updateAndSyncVBValues(newSelectedValues);
    } else if (allValuesSelected === 'true' && searchValues.length > 0) {
      const allValuesOfVariable =
        pxTableMetaToRender?.variables.find((variable) => variable.id === varId)
          ?.values || [];
      const newSelectedValues = removeMultipleValuesToVariable(
        prevSelectedValues,
        varId,
        allValuesOfVariable,
        searchValues,
      );
      updateAndSyncVBValues(newSelectedValues);
    } else if (allValuesSelected === 'true') {
      const newSelectedValues = removeAllValuesOfVariable(
        prevSelectedValues,
        varId,
      );
      updateAndSyncVBValues(newSelectedValues);
    }
  };

  function updateAndSyncVBValues(selectedVBValues: SelectedVBValues[]) {
    setSelectedVBValues(selectedVBValues);
    variables.syncVariablesAndValues(selectedVBValues);
  }

  const drawerFilter = (
    <VariableList
      pxTableMetadata={pxTableMetaToRender}
      languageDirection={i18n.dir()}
      selectedVBValues={selectedVBValues}
      isLoadingMetadata={isLoadingMetadata}
      hasLoadedDefaultSelection={hasLoadedDefaultSelection}
      isChangingCodeList={isFadingVariableList}
      handleCodeListChange={handleCodeListChange}
      handleCheckboxChange={handleCheckboxChange}
      handleMixedCheckboxChange={handleMixedCheckboxChange}
      addModal={addModal}
      removeModal={removeModal}
    />
  );
  const drawerView = <>View content</>;
  const drawerEdit = <>Edit content</>;
  const drawerSave = <>Save content</>;
  const drawerHelp = <>Help content</>;

  return (
    selectedNavigationView !== 'none' && (
      <NavigationDrawer
        ref={hideMenuRef}
        heading={t('presentation_page.sidemenu.selection.title')}
        onClose={(keyboard, view) =>
          setSelectedNavigationView(keyboard, true, view)
        }
        view={
          selectedNavigationView as 'filter' | 'view' | 'edit' | 'save' | 'help'
        }
        openedWithKeyboard={openedWithKeyboard}
      >
        {selectedNavigationView === 'filter' && drawerFilter}
        {selectedNavigationView === 'view' && drawerView}
        {selectedNavigationView === 'edit' && drawerEdit}
        {selectedNavigationView === 'save' && drawerSave}
        {selectedNavigationView === 'help' && drawerHelp}
      </NavigationDrawer>
    )
  );
}

export default Selection;
