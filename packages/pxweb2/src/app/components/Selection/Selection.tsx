import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import {
  ApiError,
  TablesService,
  SavedQueriesService,
  SelectionResponse,
  PathElement,
} from '@pxweb2/pxweb2-api-client';
import {
  mapJsonStat2Response,
  mapJsonStat2ResponsePathElements,
} from '../../../mappers/JsonStat2ResponseMapper';
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
    { id: varId, selectedCodelist: undefined, values: [value] },
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
            variable.selectedCodelist !== undefined)
        ) {
          variable.values = variable.values.filter((val) => val !== value);
        }
        if (
          !hasMultipleValuesSelected &&
          variable.selectedCodelist === undefined
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
        selectedCodelist: undefined,
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
        selectedCodelist: undefined,
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
        if (variable.selectedCodelist !== undefined) {
          return {
            id: varId,
            selectedCodelist: variable.selectedCodelist,
            values: [],
          };
        }
        if (variable.selectedCodelist === undefined) {
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
  hideMenuRef?: React.RefObject<HTMLButtonElement | null>;
};

export function Selection({
  selectedNavigationView,
  selectedTabId,
  openedWithKeyboard,
  setSelectedNavigationView,
  hideMenuRef,
}: SelectionProps) {
  const variables = useVariables();
  const app = useApp();
  const { isTablet } = useApp();
  const {
    selectedVBValues,
    setSelectedVBValues,
    hasLoadedInitialSelection,
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

  let savedQueryId = app.getSavedQueryId();

  useEffect(() => {
    if (errorMsg) {
      throw new Error(errorMsg);
    }
  }, [errorMsg]);

  useEffect(() => {
    let shouldGetInitialSelection = !hasLoadedInitialSelection;

    if (!selectedTabId) {
      return;
    }

    //  If the table has changed, or the language has changed, we need to reload the default selection
    if (
      prevTableId === '' ||
      prevTableId !== selectedTabId ||
      prevLang !== i18n.resolvedLanguage
    ) {
      variables.setHasLoadedInitialSelection(false);
      shouldGetInitialSelection = true;
      setPrevTableId(selectedTabId);
      setPrevLang(i18n.resolvedLanguage ?? '');
    }

    if (isLoadingMetadata === false) {
      variables.setIsLoadingMetadata(true);
    }

    let metaDataDefaultSelection;
    if (savedQueryId) {
      metaDataDefaultSelection = false;
    } else {
      metaDataDefaultSelection = true;
    }

    // Make parallel calls to getMetadataById and getTableById
    Promise.all([
      TablesService.getMetadataById(
        selectedTabId,
        i18n.resolvedLanguage,
        metaDataDefaultSelection,
        savedQueryId,
      ),
      TablesService.getTableById(selectedTabId, i18n.resolvedLanguage),
    ])
      .then(([Dataset, TableData]) => {
        const pxTable: PxTable = mapJsonStat2Response(Dataset, false);

        const firstMatchingPathArray = TableData.paths?.find(
          (pathArr: PathElement[]) => pathArr[0]?.id === TableData.subjectCode,
        );

        const pathElements = mapJsonStat2ResponsePathElements(
          firstMatchingPathArray ? firstMatchingPathArray.flat() : undefined,
        );

        pxTable.metadata.pathElements =
          pathElements.length > 0 ? pathElements : undefined;

        setPxTableMetadata(pxTable.metadata);
        if (pxTableMetaToRender !== null) {
          setPxTableMetaToRender(null);
        }
        setErrorMsg('');
      })
      .then(() => {
        if (!shouldGetInitialSelection) {
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

    if (shouldGetInitialSelection) {
      getInitialSelection(selectedTabId).then((selectionResponse) => {
        if (selectionResponse) {
          const initialSelection = mapTableSelectionResponse(
            selectionResponse,
          ).filter(
            (variable) =>
              variable.values.length > 0 ||
              variable.selectedCodelist !== undefined,
          );
          setSelectedVBValues(initialSelection);
          variables.syncVariablesAndValues(initialSelection);
          variables.setIsLoadingMetadata(false);
          variables.setHasLoadedInitialSelection(true);
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTabId, i18n.resolvedLanguage]);

  if (pxTableMetaToRender === null && pxTableMetadata !== null) {
    setPxTableMetaToRender(structuredClone(pxTableMetadata));
  }

  /**
   * Retrieves the initial selection for the current context, either from a saved query or by fetching the default selection.
   *
   * If a saved query ID is present, it fetches the selection associated with that saved query.
   * Otherwise, it retrieves the default selection for the specified table and language.
   * In case of an error during the API call, it sets an error message using the provided error handler.
   *
   * @param selectedTabId - The ID of the currently selected tab for which to retrieve the selection.
   * @returns A promise that resolves to a {@link SelectionResponse} object if successful, or `undefined` if an error occurs.
   */
  async function getInitialSelection(
    selectedTabId: string,
  ): Promise<SelectionResponse | undefined> {
    let response: SelectionResponse | undefined = undefined;

    try {
      if (app.getSavedQueryId()?.length > 0) {
        response = await SavedQueriesService.getSavedQuerySelection(
          app.getSavedQueryId(),
          i18n.resolvedLanguage,
        );
      } else {
        response = await TablesService.getDefaultSelection(
          selectedTabId,
          i18n.resolvedLanguage,
        );
      }
    } catch (apiError: unknown) {
      setErrorMsg(problemMessage(apiError as ApiError, selectedTabId));
    }
    return response;
  }

  async function handleCodelistChange(
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
        ?.selectedCodelist !== selectedItem?.value;

    if (!isNewCodelist) {
      return; // No change in codelist selection
    }

    // Collect selected codelists for all variables, including the newly selected one
    const selectedCodelists = getSelectedCodelists(
      prevSelectedValues,
      selectedItem,
      varId,
    );

    setIsFadingVariableList(true);

    // Get table metadata in the new codelist context
    TablesService.getMetadataById(
      selectedTabId,
      i18n.resolvedLanguage,
      false,
      '',
      selectedCodelists,
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
      hasLoadedDefaultSelection={hasLoadedInitialSelection}
      isChangingCodeList={isFadingVariableList}
      isTablet={isTablet}
      handleCodeListChange={handleCodelistChange}
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
          `presentation_page.side_menu.${selectedNavigationView}.title`,
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
