import { useTranslation } from 'react-i18next';
import { useState, useEffect, startTransition, useRef } from 'react';

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

const BULK_UPDATE_CHUNK_SIZE = 4000;
const SYNC_DEBOUNCE_MS = 150;

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    if (
      typeof window !== 'undefined' &&
      typeof window.requestAnimationFrame === 'function'
    ) {
      window.requestAnimationFrame(() => resolve());
      return;
    }

    setTimeout(resolve, 0);
  });
}

function buildMergedValuesFast(
  previousValues: string[],
  searchedValues: Value[],
): string[] {
  const merged = new Set(previousValues);
  for (let index = 0; index < searchedValues.length; index += 1) {
    merged.add(searchedValues[index].code);
  }

  return Array.from(merged);
}

async function buildRemainingValuesInChunks(
  currentValues: string[],
  searchedCodes: Set<string>,
): Promise<string[]> {
  const remainingValues: string[] = [];

  for (let index = 0; index < currentValues.length; index += 1) {
    const valueCode = currentValues[index];
    if (!searchedCodes.has(valueCode)) {
      remainingValues.push(valueCode);
    }

    if (index > 0 && index % BULK_UPDATE_CHUNK_SIZE === 0) {
      await yieldToMainThread();
    }
  }

  return remainingValues;
}

function addValueToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code'],
) {
  const newSelectedValues = selectedValuesArr.map((variable) =>
    variable.id === varId
      ? { ...variable, values: [...variable.values, value] }
      : variable,
  );

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
          return {
            ...variable,
            values: variable.values.filter((val) => val !== value),
          };
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
  hideMenuRef?: React.RefObject<HTMLButtonElement | null>;
};

export function Selection({
  selectedNavigationView,
  selectedTabId,
  openedWithKeyboard,
  setSelectedNavigationView,
  hideMenuRef,
}: SelectionProps) {
  const bulkUpdateTokenRef = useRef(0);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestSyncPayloadRef = useRef<{
    values: SelectedVBValues[];
    changedVariableId?: string;
    previousValues?: string[];
  } | null>(null);
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
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);

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
              variable.selectedCodeList !== undefined,
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

    // Preserve current pathElements so we don't lose them on codelist change
    const preservedPathElements = structuredClone(
      pxTableMetaToRender?.pathElements ?? undefined,
    );

    // Get table metadata in the new codelist context
    TablesService.getMetadataById(
      selectedTabId,
      i18n.resolvedLanguage,
      false,
      '',
      selectedCodeLists,
    )
      .then((Dataset) => {
        const pxTable: PxTable = mapJsonStat2Response(Dataset, false);

        // Reapply preserved pathElements to the new metadata
        if (preservedPathElements && preservedPathElements.length > 0) {
          pxTable.metadata.pathElements = preservedPathElements;
        }

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
    bulkUpdateTokenRef.current += 1;
    const currentValues =
      selectedVBValues.find((variables) => variables.id === varId)?.values ??
      [];

    const hasVariable =
      selectedVBValues.findIndex((variables) => variables.id === varId) !== -1;
    const hasValue = selectedVBValues
      .find((variables) => variables.id === varId)
      ?.values.includes(value);

    if (hasVariable && hasValue) {
      const newSelectedValues = removeValueOfVariable(
        selectedVBValues,
        varId,
        value,
      );

      updateAndSyncVBValues(newSelectedValues, varId, currentValues);
    }
    if (hasVariable && !hasValue) {
      const newSelectedValues = addValueToVariable(
        selectedVBValues,
        varId,
        value,
      );

      updateAndSyncVBValues(newSelectedValues, varId, currentValues);
    }
    if (!hasVariable) {
      const newSelectedValues = addValueToNewVariable(
        selectedVBValues,
        varId,
        value,
      );

      updateAndSyncVBValues(newSelectedValues, varId, currentValues);
    }
  };

  const handleMixedCheckboxChange = (
    varId: string,
    allValuesSelected: string,
    searchValues: Value[],
  ) => {
    const updateToken = bulkUpdateTokenRef.current + 1;
    bulkUpdateTokenRef.current = updateToken;
    const currentVariable = selectedVBValues.find(
      (variable) => variable.id === varId,
    );
    const currentValues = currentVariable?.values ?? [];
    const searchedCodes = new Set(searchValues.map((value) => value.code));

    const runBulkUpdate = async () => {
      if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
        const mergedValues = buildMergedValuesFast(
          currentVariable?.values ?? [],
          searchValues,
        );

        if (bulkUpdateTokenRef.current !== updateToken) {
          return;
        }

        const newSelectedValues = currentVariable
          ? selectedVBValues.map((variable) =>
              variable.id === varId
                ? { ...variable, values: mergedValues }
                : variable,
            )
          : [
              ...selectedVBValues,
              {
                id: varId,
                selectedCodeList: undefined,
                values: mergedValues,
              },
            ];

        updateAndSyncVBValues(newSelectedValues, varId, currentValues);
        return;
      }

      if (allValuesSelected === 'true' && searchValues.length > 0) {
        const remainingValues = await buildRemainingValuesInChunks(
          currentVariable?.values ?? [],
          searchedCodes,
        );

        if (bulkUpdateTokenRef.current !== updateToken) {
          return;
        }

        const newSelectedValues = currentVariable
          ? selectedVBValues.map((variable) =>
              variable.id === varId
                ? { ...variable, values: remainingValues }
                : variable,
            )
          : [
              ...selectedVBValues,
              {
                id: varId,
                selectedCodeList: undefined,
                values: [],
              },
            ];

        updateAndSyncVBValues(newSelectedValues, varId, currentValues);
        return;
      }

      if (allValuesSelected === 'true') {
        if (bulkUpdateTokenRef.current !== updateToken) {
          return;
        }

        const newSelectedValues = removeAllValuesOfVariable(
          selectedVBValues,
          varId,
        );
        updateAndSyncVBValues(newSelectedValues, varId, currentValues);
      }
    };

    void runBulkUpdate();
  };

  function updateAndSyncVBValues(
    selectedVBValues: SelectedVBValues[],
    changedVariableId?: string,
    previousValues?: string[],
  ) {
    startTransition(() => {
      setSelectedVBValues(selectedVBValues);
    });

    latestSyncPayloadRef.current = {
      values: selectedVBValues,
      changedVariableId,
      previousValues,
    };

    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }

    syncTimerRef.current = setTimeout(() => {
      const payload = latestSyncPayloadRef.current;
      if (!payload) {
        return;
      }

      variables.syncVariablesAndValues(
        payload.values,
        payload.changedVariableId,
        payload.previousValues,
      );
    }, SYNC_DEBOUNCE_MS);
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
