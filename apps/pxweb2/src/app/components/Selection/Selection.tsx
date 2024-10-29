import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

import { TableService } from '@pxweb2/pxweb2-api-client';
import { mapTableMetadataResponse } from '../../../mappers/TableMetadataResponseMapper';
import { mapTableSelectionResponse } from '../../../mappers/TableSelectionResponseMapper';
import {
  PxTableMetadata,
  SelectedVBValues,
  VariableList,
  Value,
  SelectOption,
} from '@pxweb2/pxweb2-ui';
import NavigationDrawer from '../../components/NavigationDrawer/NavigationDrawer';
import useVariables from '../../context/useVariables';
import { NavigationItem } from '../../components/NavigationMenu/NavigationItem/NavigationItemType';

function addSelectedCodeListToVariable(
  currentVariable: SelectedVBValues | undefined,
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  selectedItem: SelectOption
): SelectedVBValues[] {
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        variable.selectedCodeList = selectedItem;
        variable.values = []; // Always reset values when changing codelist
      }

      return variable;
    });
  }
  if (!currentVariable) {
    newSelectedValues = [
      ...selectedValuesArr,
      {
        id: varId,
        selectedCodeList: selectedItem,
        values: [],
      },
    ];
  }

  return newSelectedValues;
}

function removeAllSelectedCodeLists(selectedValuesArr: SelectedVBValues[]) {
  let newSelectedValues: SelectedVBValues[] = [];

  newSelectedValues = selectedValuesArr.map((variable) => {
    if (variable.selectedCodeList) {
      variable.selectedCodeList = undefined;
      variable.values = []; // Always reset values when changing codelist
    }

    return variable;
  });

  return newSelectedValues;
}

function addValueToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code']
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
  value: Value['code']
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
      console.error('Could not get code list: ', id);
    });

  return values;
}

function removeValueOfVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  value: Value['code']
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

function addAllValuesToVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string,
  allValuesOfVariable: Value[]
): SelectedVBValues[] {
  const currentVariable = selectedValuesArr.find(
    (variable) => variable.id === varId
  );
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
      if (variable.id === varId) {
        variable.values = allValuesOfVariable.map((value) => value.code);
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
        values: allValuesOfVariable.map((value) => value.code),
      },
    ];
  }

  return newSelectedValues;
}

function removeAllValuesOfVariable(
  selectedValuesArr: SelectedVBValues[],
  varId: string
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
  setSelectedNavigationView: (view: NavigationItem) => void;
};
export function Selection({
  selectedNavigationView,
  selectedTabId,
  setSelectedNavigationView,
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
  const [prevLanguage, setPrevLanguage] = useState('');

  useEffect(() => {
    let shouldGetDefaultSelection = !hasLoadedDefaultSelection;

    if (!selectedTabId) {
      return;
    }
    if (prevTableId === '' || prevTableId !== selectedTabId) {
      variables.setHasLoadedDefaultSelection(false);
      shouldGetDefaultSelection = true;
      setPrevTableId(selectedTabId);
    }

    // TODO:  Look into fixing the table state and rendering,
    //        now it doesn't work with a new codelist, but the
    //        variable state seems to be updated correctly.
    //        maybe it has to do with pxTableMetaToRender?
    if (prevLanguage === '') {
      setPrevLanguage(i18n.resolvedLanguage || '');
    }
    if (prevLanguage !== '' && prevLanguage !== i18n.resolvedLanguage) {
      const newSelectedVBValues = removeAllSelectedCodeLists(selectedVBValues);

      setSelectedVBValues(newSelectedVBValues);
      setPrevLanguage(i18n.resolvedLanguage || '');
    }
    if (isLoadingMetadata === false) {
      variables.setIsLoadingMetadata(true);
    }

    TableService.getMetadataById(selectedTabId, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(
          tableMetadataResponse
        );
        setPxTableMetadata(pxTabMetadata);
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
      .catch((error) => {
        setErrorMsg('Could not get table: ' + selectedTabId);
        setPxTableMetadata(null);
      });

    if (shouldGetDefaultSelection) {
      TableService.getDefaultSelection(selectedTabId, i18n.resolvedLanguage)
        .then((selectionResponse) => {
          //console.log(selectionResponse); TODO: remove
          const defaultSelection = mapTableSelectionResponse(
            selectionResponse
          ).filter(
            (variable) =>
              variable.values.length > 0 ||
              variable.selectedCodeList !== undefined
          );
          setSelectedVBValues(defaultSelection);
          variables.syncVariablesAndValues(defaultSelection);
          variables.setIsLoadingMetadata(false);
          variables.setHasLoadedDefaultSelection(true);
        })
        .catch((error) => {
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
    varId: string
  ) {
    const prevSelectedValues = structuredClone(selectedVBValues);
    const currentVariable = prevSelectedValues.find(
      (variable) => variable.id === varId
    );
    const lang = i18n.resolvedLanguage;

    // No language, do nothing
    if (lang === undefined) {
      return;
    }

    // No new selection made, do nothing
    if (
      !selectedItem ||
      selectedItem.value === currentVariable?.selectedCodeList?.value
    ) {
      return;
    }
    //  Incomplete selectItem
    if (!selectedItem.label || !selectedItem.value) {
      return;
    }

    const newSelectedValues = addSelectedCodeListToVariable(
      currentVariable,
      prevSelectedValues,
      varId,
      selectedItem
    );

    updateAndSyncVBValues(newSelectedValues);

    const valuesForChosenCodeList: Value[] = await getCodeListValues(
      selectedItem?.value,
      lang
    );

    if (pxTableMetaToRender === null || valuesForChosenCodeList.length < 1) {
      return;
    }

    const newPxTableMetaToRender: PxTableMetadata =
      structuredClone(pxTableMetaToRender);
    newPxTableMetaToRender.variables.forEach((variable) => {
      if (!variable.codeLists) {
        return;
      }

      variable.codeLists.forEach((codelist) => {
        if (codelist.id !== selectedItem?.value) {
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

    setPxTableMetaToRender(newPxTableMetaToRender);
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
        value
      );

      updateAndSyncVBValues(newSelectedValues);
    }
    if (hasVariable && !hasValue) {
      const newSelectedValues = addValueToVariable(
        prevSelectedValues,
        varId,
        value
      );

      updateAndSyncVBValues(newSelectedValues);
    }
    if (!hasVariable) {
      const newSelectedValues = addValueToNewVariable(
        prevSelectedValues,
        varId,
        value
      );

      updateAndSyncVBValues(newSelectedValues);
    }
  };

  const handleMixedCheckboxChange = (
    varId: string,
    allValuesSelected: string
  ) => {
    const prevSelectedValues = structuredClone(selectedVBValues);

    if (allValuesSelected === 'true') {
      const newSelectedValues = removeAllValuesOfVariable(
        prevSelectedValues,
        varId
      );
      updateAndSyncVBValues(newSelectedValues);
    }
    if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
      const allValuesOfVariable =
        pxTableMetaToRender?.variables.find((variable) => variable.id === varId)
          ?.values || [];
      const newSelectedValues = addAllValuesToVariable(
        prevSelectedValues,
        varId,
        allValuesOfVariable
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
      handleCodeListChange={handleCodeListChange}
      handleCheckboxChange={handleCheckboxChange}
      handleMixedCheckboxChange={handleMixedCheckboxChange}
    />
  );
  const drawerView = <>View content</>;
  const drawerEdit = <>Edit content</>;
  const drawerSave = <>Save content</>;
  const drawerHelp = <>Help content</>;

  return (
    selectedNavigationView !== 'none' && (
      <NavigationDrawer
        heading={t('presentation_page.sidemenu.selection.title')}
        onClose={() => {
          setSelectedNavigationView('none');
        }}
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
