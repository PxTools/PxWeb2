import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import { TableService } from '@pxweb2/pxweb2-api-client';
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
} from '@pxweb2/pxweb2-ui';
import NavigationDrawer from '../../components/NavigationDrawer/NavigationDrawer';
import useVariables from '../../context/useVariables';
import { NavigationItem } from '../../components/NavigationMenu/NavigationItem/NavigationItemType';
import useAccessibility from '../../context/useAccessibility';

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

async function getCodeListValues(id: string, lang: string): Promise<Value[]> {
  let values: Value[] = [];

  await TableService.getTableCodeListById(id, lang)
    .then((response) => {
      response.values.forEach((value) => {
        values = [...values, { code: value.code, label: value.label }];
      });
    })
    .catch((error) => {
      throw new Error(error);
    });

  return values;
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

type propsType = {
  selectedNavigationView: string;
  selectedTabId: string;
  openedWithKeyboard: boolean;
  setSelectedNavigationView: (
    keyboard: boolean,
    close: boolean,
    view: NavigationItem,
  ) => void;
  hideMenuRef?: React.RefObject<HTMLDivElement>;
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
      console.error('Selection.tsx', errorMsg);
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
      .catch(() => {
        setErrorMsg('Could not get table: ' + selectedTabId);
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
        .catch(() => {
          setErrorMsg('Error getting default selection: ' + selectedTabId);
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
    );
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

    if (pxTableMetaToRender === null) {
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

    //  Get the values for the chosen code list
    const valuesForChosenCodeList: Value[] = await getCodeListValues(
      newMappedSelectedCodeList.value,
      lang,
    )
      .finally(() => {
        setIsFadingVariableList(false);
      })
      .catch((error) => {
        console.error(
          'Could not get values for code list: ' +
            newMappedSelectedCodeList.value +
            ' ' +
            error,
        );
        return [];
      });

    if (valuesForChosenCodeList.length < 1) {
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

          newPxTableMetaToRender.variables[i].values = valuesForChosenCodeList;
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
