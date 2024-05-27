import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app.module.scss';
import {
  Button,
  PxTable,
  VariableBox,
  SelectedVBValues,
  Value,
  SelectOption,
} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
//import { NumberFormatter } from '../i18n/formatters';
import { TableService } from '@pxweb2/pxweb2-api-client';
import { mapTableMetadataResponse } from '../mappers/TableMetadataResponseMapper';
import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import { Content } from './components/Content/Content';
import NavigationBar from './components/NavigationBar/NavigationBar';
import NavigationDrawer from './components/NavigationDrawer/NavigationDrawer';

function deselectAllValuesOfVariable(
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
  const { i18n } = useTranslation();

  const [tableid, setTableid] = useState('tab638');
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>('none');
  const [pxData, setPxData] = useState<string | null>('');

  //  TODO: How much memory does this take?
  //        Is it a problem to have two states for the same table metadata?
  //        When will we need to use the original table metadata?
  const [pxTable, setPxTable] = useState<PxTable | null>(null); // TODO: Is this needed? For a soft reset of the tabel view maybe?
  const [pxTableToRender, setPxTableToRender] = useState<PxTable | null>(null);
  const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValues[]>(
    []
  );

  if (pxTableToRender === null && pxTable !== null) {
    setPxTableToRender(structuredClone(pxTable));
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
    const variable = prevSelectedValues.find(
      (variable) => variable.id === varId
    );

    if (
      !selectedItem ||
      selectedItem.value === variable?.selectedCodeList?.value
    ) {
      // No new selection made, do nothing
      return;
    }

    if (!selectedItem.label || !selectedItem.value) {
      return; //  TODO: Incomplete selectItem, maybe throw an error? Should not happen
    }

    if (variable) {
      const newSelectedValues = prevSelectedValues.map((variable) => {
        if (variable.id === varId) {
          variable.selectedCodeList = selectedItem;
          variable.values = [];
        }

        return variable;
      });

      setSelectedVBValues(newSelectedValues);
    }
    if (!variable) {
      const newSelectedValues = [
        ...prevSelectedValues,
        {
          id: varId,
          selectedCodeList: selectedItem,
          values: [],
        },
      ];

      setSelectedVBValues(newSelectedValues);
    }

    //  TODO: This currently returns dummy data until we have the API call setup for it
    const valuesForChosenCodeList: Value[] = getCodeListValues(
      selectedItem?.value
    );

    if (pxTableToRender !== null) {
      const tmpTable: PxTable = structuredClone(pxTableToRender);

      pxTableToRender.variables.forEach((variable) => {
        if (variable.codeLists) {
          variable.codeLists.forEach((codelist) => {
            if (codelist.id === selectedItem?.value) {
              for (let i = 0; i < tmpTable.variables.length - 1; i++) {
                if (tmpTable.variables[i].id === variable.id) {
                  if (valuesForChosenCodeList.length > 0) {
                    tmpTable.variables[i].values = valuesForChosenCodeList;

                    break;
                  }

                  // TODO: How to handle this? No values in response from API. Not possible, there will always be values?
                  console.error(
                    "Table: '" +
                      pxTableToRender.id +
                      "' Variable: '" +
                      variable.id +
                      "' CodeList: '" +
                      codelist.id +
                      "' has no values"
                  );

                  break;
                }
              }
            }
          });
        }
      });

      setPxTableToRender(tmpTable);
    }
  }

  const handleMixedCheckboxChange = (
    varId: string,
    allValuesSelected: string
  ) => {
    const prevSelectedValues = structuredClone(selectedVBValues);

    if (allValuesSelected === 'true') {
      const newSelectedValues = deselectAllValuesOfVariable(
        prevSelectedValues,
        varId
      );

      setSelectedVBValues(newSelectedValues);
    }
    if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
      const variable = prevSelectedValues.find(
        (variable) => variable.id === varId
      );
      const allValuesOfVariable =
        pxTableToRender?.variables.find((variable) => variable.id === varId)
          ?.values || [];

      if (variable) {
        const newSelectedValues = prevSelectedValues.map((variable) => {
          if (variable.id === varId) {
            variable.values = allValuesOfVariable.map((value) => value.code);
          }

          return variable;
        });

        setSelectedVBValues(newSelectedValues);
      }
      if (!variable) {
        const newSelectedValues = [
          ...prevSelectedValues,
          {
            id: varId,
            selectedCodeList: undefined,
            values: allValuesOfVariable.map((value) => value.code),
          },
        ];

        setSelectedVBValues(newSelectedValues);
      }
    }
  };

  const handleCheckboxChange = (varId: string, value: Value['code']) => {
    const hasVariable =
      selectedVBValues.findIndex((variables) => variables.id === varId) !== -1;
    const hasValue = selectedVBValues
      .find((variables) => variables.id === varId)
      ?.values.includes(value);
    const prevSelectedValues = structuredClone(selectedVBValues);

    if (hasVariable) {
      // doesn't have value, add it
      if (!hasValue) {
        setSelectedVBValues(
          prevSelectedValues.map((variable) => {
            if (variable.id === varId) {
              variable.values = [...variable.values, value];
            }

            return variable;
          })
        );
      }

      // has value, remove it
      if (hasValue) {
        let hasMultipleValues = false;

        setSelectedVBValues(
          prevSelectedValues.map((variable) => {
            if (variable.id === varId) {
              hasMultipleValues = variable.values.length > 1;

              variable.values = variable.values.filter((val) => val !== value);
            }

            return variable;
          })
        );

        // remove the variable if it now has no values or specified codelist
        if (!hasMultipleValues) {
          setSelectedVBValues(
            prevSelectedValues.filter(
              (variables) =>
                variables.id !== varId ||
                (variables.id === varId &&
                  variables.selectedCodeList !== undefined)
            )
          );
        }
      }
    }
    if (!hasVariable) {
      setSelectedVBValues([
        ...prevSelectedValues,
        { id: varId, selectedCodeList: undefined, values: [value] },
      ]);
    }
  };

  const getTable = (id: string) => {
    TableService.getMetadataById(id, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTab: PxTable = mapTableMetadataResponse(tableMetadataResponse);
        setPxTable(pxTab);

        if (pxTableToRender !== null) {
          setPxTableToRender(null);
        }

        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTable(null);
      });
    getData(id);
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

  const handleVBReset = () => {
    // TODO: Do we need this?
    if (pxTableToRender !== null) {
      setPxTableToRender(null);
    }
    if (selectedVBValues.length > 0) {
      setSelectedVBValues([]);
    }
  };

  const getData = (id: string) => {
    const url =
      'https://api.scb.se/OV0104/v2beta/api/v2/tables/' +
      id +
      '/data?lang=' +
      i18n.resolvedLanguage +
      '&outputFormat=html5_table';
    fetch(url)
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        const decoder = new TextDecoder('iso-8859-1');
        const tableDataResponse = decoder.decode(buffer);
        const thePxData: string = tableDataResponse;
        setPxData(thePxData);
        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTable(null);
      });
  };

  const drawerFilter = (
    <>
      <select
        name="tabid"
        id="tabid"
        onChange={(e) => setTableid(e.target.value)}
      >
        <option value="TAB638">TAB638</option>
        <option value="TAB1292">TAB1292</option>
        <option value="TAB5659">TAB5659</option>
      </select>
      <Button variant="tertiary" onClick={() => getTable(tableid)}>
        Get table
      </Button>
      <div className={styles.variableBoxContainer}>
        {/* TODO: I think the warning in the console about unique IDs is the variable.id below*/}
        {pxTableToRender &&
          pxTableToRender.variables.length > 0 &&
          pxTableToRender.variables.map(
            (variable) =>
              variable.id && (
                <VariableBox
                  id={variable.id}
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
    </>
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
              heading="Filtrer"
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
          {pxData && <div dangerouslySetInnerHTML={{ __html: pxData }} />}{' '}
        </Content>
      </div>
    </>
  );
}

export default App;
