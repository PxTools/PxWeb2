import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import { ApiError, TableService } from '@pxweb2/pxweb2-api-client';
import { mapJsonStat2Response } from '../../../mappers/JsonStat2ResponseMapper';
import { mapTableSelectionResponse } from '../../../mappers/TableSelectionResponseMapper';
import {
  PxTable,
  PxTableMetadata,
  SelectedVBValues,
  SelectOption,
  Value,
  ValueDisplayType,
  Variable,
  VariableList,
} from '@pxweb2/pxweb2-ui';
import {
  DrawerEdit,
  DrawerHelp,
  DrawerSave,
  DrawerView,
  NavigationDrawer,
} from '../NavigationDrawer';
import useVariables from '../../context/useVariables';
import useApp from '../../context/useApp';
import { NavigationItem } from '../../components/NavigationMenu/NavigationItem/NavigationItemType';
import useAccessibility from '../../context/useAccessibility';
import { problemMessage } from '../../util/problemMessage';
import {
  getSelectedCodelists,
  updateSelectedCodelistForVariable,
} from './selectionUtils';

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
    .filter((value) => value !== null);

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
    .filter((value) => value !== null);

  return newValues;
}

export interface VariableWithDisplayType extends Variable {
  valueDisplayType: ValueDisplayType;
}

type NavigationView = 'selection' | 'view' | 'edit' | 'save' | 'help' | 'none';

type SelectionProps = {
  selectedNavigationView: NavigationView;
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
}: SelectionProps) {
  const variables = useVariables();
  const { isTablet } = useApp();
  const {
    selectedVBValues,
    setSelectedVBValues,
    hasLoadedDefaultSelection,
    isLoadingMetadata,
    pxTableMetadata,
    setPxTableMetadata,
  } = variables;
  const [errorMsg, setErrorMsg] = useState('');
  const { i18n, t } = useTranslation();
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
      setPrevLang(i18n.resolvedLanguage ?? '');
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
    selectedItem: SelectOption,
    varId: string,
  ) {
    const lang = i18n.resolvedLanguage;

    // No language, do nothing
    if (lang === undefined) {
      return;
    }

    const currentVariableMetadata = pxTableMetaToRender?.variables.find(
      (variable) => variable.id === varId,
    );

    if (pxTableMetaToRender === null || currentVariableMetadata === undefined) {
      return;
    }

    const prevSelectedValues = structuredClone(selectedVBValues);

    const isNewCodelist =
      prevSelectedValues?.find((variable) => variable.id === varId)
        ?.selectedCodeList !== selectedItem?.value;

    if (!isNewCodelist) {
      return; // No change in codelist selection
    }

    // Collect selected codelists for all variables, including the newly selected one
    const selectedCodeLists = getSelectedCodelists(
      prevSelectedValues,
      selectedItem,
      varId,
    );

    setIsFadingVariableList(true);

    // Get table metadata in the new codelist context
    TableService.getMetadataById(
      selectedTabId,
      i18n.resolvedLanguage,
      false,
      selectedCodeLists,
    )
      .then((Dataset) => {
        const pxTable: PxTable = mapJsonStat2Response(Dataset, false);

        setPxTableMetadata(pxTable.metadata);

        if (pxTableMetaToRender !== null) {
          setPxTableMetaToRender(null);
        }

        const newSelectedValues = updateSelectedCodelistForVariable(
          selectedItem,
          varId,
          prevSelectedValues,
          currentVariableMetadata,
          pxTable.metadata,
        );

        if (!newSelectedValues) {
          throw new Error(
            `Could not update selected codelist for variable: ${varId}`,
          );
        }

        // UpdateAndSyncVBValues with the new selected values to trigger API data-call
        updateAndSyncVBValues(newSelectedValues);

        setErrorMsg('');
      })
      .finally(() => {
        setIsFadingVariableList(false);
      })
      .catch((apiError: ApiError) => {
        setErrorMsg(problemMessage(apiError, selectedTabId));
        setPxTableMetadata(null);
      })
      .catch((error) => {
        setErrorMsg(`Could not get table: ${selectedTabId} ${error.message}`);
        setPxTableMetadata(null);
      });
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

  const drawerSelection = (
    <VariableList
      pxTableMetadata={pxTableMetaToRender}
      languageDirection={i18n.dir()}
      selectedVBValues={selectedVBValues}
      isLoadingMetadata={isLoadingMetadata}
      hasLoadedDefaultSelection={hasLoadedDefaultSelection}
      isChangingCodeList={isFadingVariableList}
      isTablet={isTablet}
      handleCodeListChange={handleCodeListChange}
      handleCheckboxChange={handleCheckboxChange}
      handleMixedCheckboxChange={handleMixedCheckboxChange}
      addModal={addModal}
      removeModal={removeModal}
    />
  );

  return (
    selectedNavigationView !== 'none' && (
      <NavigationDrawer
        ref={hideMenuRef}
        heading={t(
          `presentation_page.sidemenu.${selectedNavigationView}.title`,
        )}
        onClose={(keyboard, view) =>
          setSelectedNavigationView(keyboard, true, view)
        }
        view={selectedNavigationView}
        openedWithKeyboard={openedWithKeyboard}
      >
        {selectedNavigationView === 'selection' && drawerSelection}
        {selectedNavigationView === 'view' && <DrawerView />}
        {selectedNavigationView === 'edit' && <DrawerEdit />}
        {selectedNavigationView === 'save' && (
          <DrawerSave tableId={selectedTabId} />
        )}
        {selectedNavigationView === 'help' && <DrawerHelp />}
      </NavigationDrawer>
    )
  );
}

export default Selection;
