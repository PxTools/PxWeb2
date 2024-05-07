import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './app.module.scss';
import { Button, PxTable, VariableBox } from '@pxweb2/pxweb2-ui';
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
        const pxTab: PxTable = mapTableMetadataResponse(tableMetadataResponse);
        setPxTable(pxTab);
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
      <Button variant="secondary" onClick={() => getTable(tableid)}>
        Get table
      </Button>
      <div>
        {/* TODO: I think the warning in the console about unique IDs is the variable.id below*/}
        {pxTable &&
          pxTable.variables.length > 0 &&
          pxTable.variables.map(
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
        <Content topLeftBorderRadius={selected === 'none'}>content </Content>
      </div>
    </>
  );
}

export default App;
