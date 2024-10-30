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
  allValuesOfVariable: Value[],
  searchedValues: Value[]
): SelectedVBValues[] {
const currentVariable = selectedValuesArr.find(
    (variable) => variable.id === varId
  );
  let newSelectedValues: SelectedVBValues[] = [];

  if (currentVariable) {
    newSelectedValues = selectedValuesArr.map((variable) => {
       if (variable.id === varId) {
        const prevValues = [...variable.values];
        const valuesList = allValuesOfVariable
          .filter(v => prevValues.includes(v.code) || searchedValues.includes(v))
          .map(value => value.code);
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
        values: allValuesOfVariable.filter(v => searchedValues.includes(v)).map((value) => value.code),
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
  const [pxTableMetaToRender, setPxTableMetaToRender] =
    // Metadata to render in the UI
    useState<PxTableMetadata | null>(null);
  const { i18n, t } = useTranslation();
  const { hasLoadedDefaultSelection } = useVariables();
  const { isLoadingMetadata } = useVariables();
  const { pxTableMetadata, setPxTableMetadata } = useVariables();

  const [prevTableId, setPrevTableId] = useState('');

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

  function handleCodeListChange(
    selectedItem: SelectOption | undefined,
    varId: string
  ) {
    const prevSelectedValues = structuredClone(selectedVBValues);
    const currentVariable = prevSelectedValues.find(
      (variable) => variable.id === varId
    );

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

    //  TODO: This currently returns dummy data until we have the API call setup for it
    const valuesForChosenCodeList: Value[] = getCodeListValues(
      selectedItem?.value
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
    allValuesSelected: string,
    searchValues: Value[]
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
        allValuesOfVariable,
        searchValues
      );
     updateAndSyncVBValues(newSelectedValues);
    }
  };

  function updateAndSyncVBValues(selectedVBValues: SelectedVBValues[]) {
    setSelectedVBValues(selectedVBValues);
    variables.syncVariablesAndValues(selectedVBValues);
  }

  const getCodeListValues = (id: string) => {
    /* TODO: Implement querying the API */
    const dummyValues: Value[] = [
      { code: 'Dummy Code 1', label: 'Dummy Value 1' },
      { code: '01', label: '01 Stockholm county' },
      { code: 'Dummy Code 2', label: 'Dummy Value 2' },
      { code: 'Dummy Code 3', label: 'Dummy Value 3' },
      { code: 'Dummy Code 4', label: 'Dummy Value 4' },
      { code: 'Dummy Code 5', label: 'Dummy Value 5' },
      { code: 'Dummy Code 6', label: 'Dummy Value 6' },
      { code: 'Dummy Code 7', label: 'Dummy Value 7' },
    ];

    return dummyValues;
  };
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
