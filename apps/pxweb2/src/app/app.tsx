import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app.module.scss';
import { Button, PxTableMetadata, VariableBox, Variable, Table, VartypeEnum, PxTable, fakeData } from '@pxweb2/pxweb2-ui';
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

export function App() {
  const { i18n } = useTranslation();

  const [tableid, setTableid] = useState('tab638');
  const [errorMsg, setErrorMsg] = useState('');
  const [pxTable, setPxTable] = useState<PxTable | null>(null);
  const [selected, setSelected] = useState<NavigationItem>('none');
  const [pxData, setPxData] = useState<string | null>('');



  const changeSelected = (newSelected: NavigationItem) => {
    if (selected === newSelected) {
      setSelected('none');
    } else {
      setSelected(newSelected);
    }
  };

  useLocalizeDocumentAttributes();

  const getTable = (id: string) => {
    TableService.getMetadataById(id, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(tableMetadataResponse);
        const pxTable: PxTable = {metadata: pxTabMetadata, data: {}, stub: [], heading: []};
        setPxTable(pxTable);
        setErrorMsg('');
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + id);
        setPxTable(null);
      });
    getData(id);
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

  const getFakeTable = () => {
    const variables: Variable[] = [
      {id: "Region", 
       label: "region", 
       type: VartypeEnum.GEOGRAPHICAL_VARIABLE, 
       mandatory: false, 
      //  values: Array.from(Array(293).keys()).map(i => {return {label: "region_" + (i + 1), code: "R_" + (i + 1) }})},
       values: Array.from(Array(2).keys()).map(i => {return {label: "region_" + (i + 1), code: "R_" + (i + 1) }})},
       {id: "Alder", 
       label: "ålder", 
       type: VartypeEnum.REGULAR_VARIABLE, 
       mandatory: false, 
      //  values: Array.from(Array(65).keys()).map(i => {return {label: "år " + (i + 1), code: "" + (i + 1) }})},
       values: Array.from(Array(2).keys()).map(i => {return {label: "år " + (i + 1), code: "" + (i + 1) }})},
      //  {id: "Civilstatus", 
      //  label: "civilstatus", 
      //  type: VartypeEnum.REGULAR_VARIABLE, 
      //  mandatory: false, 
      //  values: Array.from(Array(5).keys()).map(i => {return {label: "CS_" + (i + 1), code: "" + (i + 1) }})},
       {id: "Kon", 
       label: "kön", 
       type: VartypeEnum.REGULAR_VARIABLE, 
       mandatory: false, 
       values: Array.from(Array(2).keys()).map(i => {return {label: "G_" + (i + 1), code: "" + (i + 1) }})},
       {id: "TIME", 
       label: "tid", 
       type: VartypeEnum.TIME_VARIABLE, 
       mandatory: false, 
       values: Array.from(Array(2).keys()).map(i => {return {label: "" + (1968 + i), code: "" + (1968 + i) }})}
      ];

      const tableMeta : PxTableMetadata = {id: "test01", label: "Test table", variables: variables};
      const table : PxTable = {metadata: tableMeta, data: {}, heading: [variables[0], variables[1]], stub: [variables[2],variables[3]]};
      fakeData(table, [], 0, 0);
      setPxTable(table);
  }

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
        <option value="TAB1128">TAB1128 (LARGE)</option>
      </select>
      <Button variant="tertiary" onClick={() => getTable(tableid)}>
        Get table
      </Button>
      <Button variant="tertiary" onClick={() => getFakeTable()}>
        Get fake table
      </Button>
      <div className={styles.variableBoxContainer}>
        {/* TODO: I think the warning in the console about unique IDs is the variable.id below*/}
        {pxTable?.metadata &&
          pxTable.metadata.variables.length > 0 &&
          pxTable.metadata.variables.map(
            (variable) =>
              variable.id && (
                <VariableBox
                  id={variable.id}
                  label={variable.label}
                  mandatory={variable.mandatory}
                  values={variable.values}
                  codeLists={variable.codeLists}
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
          <NavigationRail onChange={changeSelected} selected={selected} />
          {selected !== 'none' && (
            <NavigationDrawer
              heading="Filtrer"
              onClose={() => {
                setSelected('none');
              }}
            >
              {selected === 'filter' && drawerFilter}
              {selected === 'view' && drawerView}
              {selected === 'edit' && drawerEdit}
              {selected === 'save' && drawerSave}
              {selected === 'help' && drawerHelp}
            </NavigationDrawer>
          )}
        </div>
        <div className={styles.mobileNavigation}>
          <NavigationBar onChange={changeSelected} selected={selected} />
        </div>
          <Content topLeftBorderRadius={selected === 'none'}>
            {pxTable?.data && (
                <div>
                  <Table pxtable={pxTable}/>
                </div>
              )}
            {pxData && (
              <div dangerouslySetInnerHTML={{ __html: pxData }} />
            )} 
          </Content>
      </div>
    </>
  );
}

export default App;
