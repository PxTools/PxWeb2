import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app.module.scss';
import {
  Button,
  PxTable,
  VariableBox,
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

export type NavigationItem =
  | 'none'
  | 'filter'
  | 'view'
  | 'edit'
  | 'save'
  | 'help';

interface SelectedVBValuesType {
  variables: [
    variableId: string,
    selectedCodeList: string | undefined,
    selectedVariables: Value['code'][] | undefined
  ];
}

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
  //const [selectedVBValues, setSelectedVBValues] = useState<Value['code'][]>([]);
  //const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValuesType[]>([]);

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

  function selectedCodeListChanged(selectedItem: SelectOption | undefined) {
    selectedItem
      ? console.log('Selected codelist - test: ' + selectedItem.label)
      : console.log('No codelist selected - test');

    // What happens now?
    // - We need to query the API for the new, codelist specific values (not part of this task)
    //  - We need to have some dummy values to test with
    // - We need to update the variable box with the new, codelist specific values (the dummy data)

    // TODOs:
    // Select placeholder text needs to be updated to the chosen value
    // The selected value needs to be selected in the Modal list
    // - currently, this now only happens if the values dont change (component doesnt rerender)
    // - or does it?
    // When the codelist is changed, the selected values HAVE to be reset
    // When the codelist is changed, the state of the checkboxes should be updated to reflect the new values
    // When changing language, the codelist texts do not change
    // - this is because the codelist texts are from the api
    // - - we need to reset everything when changing language

    if (!selectedItem) {
      return;
    }

    //  This currently returns dummy data until we have the API call setup for it
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
    //const dummyValues: Value[] = [];

    return dummyValues;
  };

  const handleVBReset = () => {
    //  TODO: Also need to reset the entire selectedValues state
    if (pxTableToRender !== null) {
      setPxTableToRender(null);
    }

    //setSelectedVBValues([]);
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
                  onChangeCodeList={selectedCodeListChanged}
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
