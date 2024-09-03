import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cl from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './app.module.scss';
import { ContentTop } from './components/ContentTop/ContentTop';
import {
  PxTableMetadata,
  Table,
  SelectedVBValues,
  Value,
  SelectOption,
  EmptyState,
  VariableList,
} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
import { TableService } from '@pxweb2/pxweb2-api-client';
import { mapTableMetadataResponse } from '../mappers/TableMetadataResponseMapper';
import { mapTableSelectionResponse } from '../mappers/TableSelectionResponseMapper';
import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import { Content } from './components/Content/Content';
import NavigationBar from './components/NavigationBar/NavigationBar';
import NavigationDrawer from './components/NavigationDrawer/NavigationDrawer';
import useVariables from './context/useVariables';
import useTableData from './context/useTableData';
import { Footer } from './components/Footer/Footer';

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
    if (errorMsg !== '') {
      console.error('ERROR: App.tsx:', errorMsg);
    }
  }, [errorMsg]);

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

        if (pxTableMetaToRender !== null) {
          setPxTableMetaToRender(null);
        }

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
    <>
      <select
        name="tabid"
        id="tabid"
        value={tableId}
        onChange={(e) => {
          setSelectedTableId(e.target.value);
          navigate(`/table/${e.target.value}`);
        }}
      >
        <option value="TAB638">TAB638</option>
        <option value="TAB1292">TAB1292</option>
        <option value="TAB5659">TAB5659</option>
        <option value="TAB1544">TAB1544 (decimals)</option>
        <option value="TAB4246">TAB4246 (decimals)</option>
        <option value="TAB1128">TAB1128 (large)</option>
      </select>
      <br />
      <br />
      <div className={styles.variableListContainer}>
        <VariableList
          pxTableMetadata={pxTableMetaToRender}
          selectedVBValues={selectedVBValues}
          isLoadingMetadata={isLoadingMetadata}
          hasLoadedDefaultSelection={hasLoadedDefaultSelection}
          handleCodeListChange={handleCodeListChange}
          handleCheckboxChange={handleCheckboxChange}
          handleMixedCheckboxChange={handleMixedCheckboxChange}
        />
      </div>
    </>
  );
  const drawerView = <>View content</>;
  const drawerEdit = <>Edit content</>;
  const drawerSave = <>Save content</>;
  const drawerHelp = <>Help content</>;

  return (
    // <>
    //   <Header />
    //   <div className={styles.mainContainer}>
    //     {/* <div className={styles.desktopNavigation}> */}
    //     <div className={styles.desktopNavigation}>
    //       <NavigationRail
    //         onChange={changeSelectedNavView}
    //         selected={selectedNavigationView}
    //       />
    //     </div>
    //     <div className={styles.main}>
    //       <div>
    //       {selectedNavigationView !== 'none' && (
    //         // <div className={styles.scrollable}>
    //         <NavigationDrawer
    //           heading={t('presentation_page.sidemenu.selection.title')}
    //           onClose={() => {
    //             setSelectedNavigationView('none');
    //           }}
    //         >
    //           {selectedNavigationView === 'filter' && drawerFilter}
    //           {selectedNavigationView === 'view' && drawerView}
    //           {selectedNavigationView === 'edit' && drawerEdit}
    //           {selectedNavigationView === 'save' && drawerSave}
    //           {selectedNavigationView === 'help' && drawerHelp}
    //         </NavigationDrawer>
    //         // </div>
    //       )}
    //       </div>
    //       {/* <div className={styles.scrollable}> */}
    //       <Content topLeftBorderRadius={selectedNavigationView === 'none'}>
    //         {tableData.data && pxTableMetadata && (
    //           <>
    //             <ContentTop
    //               staticTitle={pxTableMetadata?.label}
    //               pxtable={tableData.data}
    //             />

    //             {!isMissingMandatoryVariables && (
    //               <div className={styles.tableWrapper}>
    //                 <Table pxtable={tableData.data} />
    //               </div>
    //             )}

    //             {!isLoadingMetadata && isMissingMandatoryVariables && (
    //               <EmptyState
    //                 headingTxt={t(
    //                   'presentation_page.main_content.table.warnings.missing_mandatory.title'
    //                 )}
    //               >
    //                 {t(
    //                   'presentation_page.main_content.table.warnings.missing_mandatory.description'
    //                 )}
    //               </EmptyState>
    //             )}
    //           </>
    //         )}{' '}
    //       </Content>
    //       {/* </div> */}
    //     </div>
    //     <div className={cl(styles.mobileNavigation, styles.scrollable)}>
    //       <NavigationBar
    //         onChange={changeSelectedNavView}
    //         selected={selectedNavigationView}
    //       />
    //     </div>
    //   </div>
    // </>

    <>
      <Header />
      <div className={styles.extra1}>
        <NavigationRail
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
        <div className={styles.mainContainer}>
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
          <div className={styles.contentAndFooterContainer}>
            <div className={styles.contentContainer}>
              {tableData.data && pxTableMetadata && (
                <>
                  <ContentTop
                    staticTitle={pxTableMetadata?.label}
                    pxtable={tableData.data}
                  />
                  {!isMissingMandatoryVariables && (
                    <div className={styles.tableWrapper}>
                      <Table pxtable={tableData.data} />
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
            </div>
            <div className={styles.footerContainer}>
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <NavigationBar
        onChange={changeSelectedNavView}
        selected={selectedNavigationView}
      />
    </>

    // <>
    //   <div className={styles.testHeader}>Header</div>
    //   <div className={styles.extra1}>
    //     <div className={styles.testNavigationRail}>NavRail</div>
    //     <div className={styles.testMainContainer}>
    //       <div className={styles.testNavigationDrawer}>NavDrawer</div>
    //       <div className={styles.testContentAndFooter}>
    //         ContentAndFooter
    //         <div className={styles.testContentContainer}>
    //           ContentContainer
    //           <div className={styles.testContentTop}>ContentTop</div>
    //           <div className={styles.testTable}>
    //             <table>
    //               <tr>
    //                 <th>Name</th>
    //                 <th>Col1</th>
    //                 <th>Col2</th>
    //                 <th>Col3</th>
    //                 <th>Col4</th>
    //                 <th>Col5</th>
    //                 <th>Col6</th>
    //                 <th>Col7</th>
    //                 <th>Col8</th>
    //                 <th>Col9</th>
    //               </tr>
    //               <tr>
    //                 <td rowSpan={3}>Mark Smith</td>
    //                 <td>English</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //               </tr>
    //               <tr>
    //                 <td>Maths</td>
    //                 <td>82</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //               </tr>
    //               <tr>
    //                 <td>Science</td>
    //                 <td>91</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //                 <td>67</td>
    //               </tr>
    //             </table>
    //           </div>
    //         </div>
    //         <div className={styles.testFooter}>Footer</div>
    //       </div>
    //     </div>
    //   </div>
    //   <div className={styles.testNavigationBar}>NavBar</div>
    // </>
  );
}

export default App;
