import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app.module.scss';
import { ContentTop } from './components/ContentTop/ContentTop';
import {
  Button,
  PxTableMetadata,
  VariableBox,
  Variable,
  Table,
  VartypeEnum,
  PxTable,
  fakeData,
  SelectedVBValues,
  Value,
  SelectOption,
  EmptyState,
} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
import { Dataset, TableService } from '@pxweb2/pxweb2-api-client';
import { mapTableMetadataResponse } from '../mappers/TableMetadataResponseMapper';
import { mapTableSelectionResponse } from '../mappers/TableSelectionResponseMapper';
import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import { Content } from './components/Content/Content';
import NavigationBar from './components/NavigationBar/NavigationBar';
import NavigationDrawer from './components/NavigationDrawer/NavigationDrawer';
import useVariables from './context/useVariables';
import useTableData from './context/useTableData';
import { useNavigate, useParams } from 'react-router-dom';

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

export type NavigationItem =
  | 'none'
  | 'filter'
  | 'view'
  | 'edit'
  | 'save'
  | 'help';

export function App() {
  const { tableId } = useParams<{ tableId: string }>();
  const [prevTableId, setPrevTableId] = useState('');
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const variables = useVariables();
  const tableData = useTableData();
  const [selectedTableId, setSelectedTableId] = useState(
    tableId ? tableId : 'tab638'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [pxTable, setPxTable] = useState<PxTable | null>(null);
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>('filter');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(true);
  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);

  // Initial metadata from the api
  const [pxTableMetadata, setPxTableMetadata] =
    useState<PxTableMetadata | null>(null);
  const [pxTableMetaToRender, setPxTableMetaToRender] =
    // Metadata to render in the UI
    useState<PxTableMetadata | null>(null);
  const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValues[]>(
    []
  );
  const [hasLoadedDefaultSelection, setHasLoadedDefaultSelection] =
    useState(false);

  /**
   * Updates useState hook and synchronizes variables context with the selected VB values.
   *
   * @param selectedVBValues - An array of selected VB values.
   */
  function updateAndSyncVBValues(selectedVBValues: SelectedVBValues[]) {
    setSelectedVBValues(selectedVBValues);
    variables.syncVariablesAndValues(selectedVBValues);
  }

  useEffect(() => {
    const hasSelectedMandatoryVariables = pxTableMetadata?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) => selectedVariable.id === variable.id
        )
      );

    if (hasSelectedMandatoryVariables) {
      tableData.fetchTableData(tableId ? tableId : 'tab638', i18n);

      setIsMissingMandatoryVariables(false);
    }
    if (!hasSelectedMandatoryVariables) {
      setIsMissingMandatoryVariables(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables, i18n.resolvedLanguage]); // Should only run this useEffect when selectedVBValues are in sync with variables context

  useEffect(() => {
    let shouldGetDefaultSelection = !hasLoadedDefaultSelection;

    if (!tableId) {
      return;
    }

    if (prevTableId === '' || prevTableId !== tableId) {
      setHasLoadedDefaultSelection(false);
      shouldGetDefaultSelection = true;
      setPrevTableId(tableId);
    }

    if (isLoadingMetadata === false) {
      setIsLoadingMetadata(true);
    }

    TableService.getMetadataById(tableId, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(
          tableMetadataResponse
        );
        setPxTableMetadata(pxTabMetadata);

        handleVBReset();

        setErrorMsg('');
      })
      .then(() => {
        if (!shouldGetDefaultSelection) {
          setIsLoadingMetadata(false);

          return;
        }

        TableService.getDefaultSelection(tableId, i18n.resolvedLanguage)
          .then((selectionResponse) => {
            const defaultSelection = mapTableSelectionResponse(
              selectionResponse
            ).filter(
              (variable) =>
                variable.values.length > 0 ||
                variable.selectedCodeList !== undefined
            );

            updateAndSyncVBValues(defaultSelection);
            setIsLoadingMetadata(false);
            setHasLoadedDefaultSelection(true);
          })
          .catch((error) => {
            setErrorMsg('Error getting default selection: ' + tableId);
          });
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + selectedTableId);
        setPxTableMetadata(null);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, i18n.resolvedLanguage]);

  if (pxTableMetaToRender === null && pxTableMetadata !== null) {
    setPxTableMetaToRender(structuredClone(pxTableMetadata));
  }

  const changeSelectedNavView = (newSelectedNavView: NavigationItem) => {
    if (selectedNavigationView === newSelectedNavView) {
      setSelectedNavigationView('none');
    } else {
      setSelectedNavigationView(newSelectedNavView);
    }
  };

  useLocalizeDocumentAttributes();

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

  function handleVBReset() {
    if (pxTableMetaToRender !== null) {
      setPxTableMetaToRender(null);
    }
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
    <div className={styles.variableBoxContainer}>
      {!isLoadingMetadata &&
        pxTableMetaToRender &&
        pxTableMetaToRender.variables.length > 0 &&
        pxTableMetaToRender.variables.map(
          (variable, index) =>
            variable.id && (
              <VariableBox
                id={variable.id}
                key={variable.id + pxTableMetaToRender.id}
                initialIsOpen={index === 0}
                tableId={pxTableMetaToRender.id}
                label={variable.label}
                mandatory={variable.mandatory}
                values={variable.values}
                codeLists={variable.codeLists}
                selectedValues={selectedVBValues}
                onChangeCodeList={handleCodeListChange}
                onChangeMixedCheckbox={handleMixedCheckboxChange}
                onChangeCheckbox={handleCheckboxChange}
              />
            )
        )}
    </div>
  );
  const drawerView = <>View content</>;
  const drawerEdit = <>Edit content</>;
  const drawerSave = <>Save content</>;
  const drawerHelp = <>Help content</>;

  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.desktopNavigation}>
          <NavigationRail
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
          {selectedNavigationView !== 'none' && (
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
          )}
        </div>
        <div className={styles.mobileNavigation}>
          <NavigationBar
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        </div>
        <Content topLeftBorderRadius={selectedNavigationView === 'none'}>
          {tableData.data && pxTableMetadata && (
            <>
              <ContentTop
                staticTitle={pxTableMetadata?.label}
                pxtable={JSON.parse(tableData.data)}
              />

              {!isMissingMandatoryVariables && (
                <div className={styles.tableWrapper}>
                  <Table pxtable={JSON.parse(tableData.data)} />
                </div>
              )}

              {!isLoadingMetadata && isMissingMandatoryVariables && (
                <EmptyState
                  headingTxt={t(
                    'presentation_page.main_content.table.warnings.missing_mandatory.title'
                  )}
                >
                  {t(
                    'presentation_page.main_content.table.warnings.missing_mandatory.description'
                  )}
                </EmptyState>
              )}
            </>
          )}{' '}
        </Content>
      </div>
    </>
  );
}

export default App;
