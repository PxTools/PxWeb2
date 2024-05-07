import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import cl from 'clsx';

import styles from './app.module.scss';
import {
  Button,
  BodyShort,
  BodyLong,
  Heading,
  Ingress,
  Label,
  Select,
  SelectOption,
  PxTable,
  Search,
  Tag,
  VariableBox,
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

function test(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
  event.preventDefault();
  console.log('test');
}
function testSubmit() {
  console.log('test submit');
}
function selectedOptionChanged(selectedItem: SelectOption | undefined) {
  selectedItem
    ? console.log('Selected option: ' + selectedItem.label)
    : console.log('No option selected');
}

export type NavigationItem =
  | 'none'
  | 'filter'
  | 'view'
  | 'edit'
  | 'save'
  | 'help';

export function App() {
  const { t, i18n } = useTranslation();

  const [tableid, setTableid] = useState('tab638');
  const [errorMsg, setErrorMsg] = useState('');
  const [pxTable, setPxTable] = useState<PxTable | null>(null);
  const [selected, setSelected] = useState<NavigationItem>('none');
  const [showDevStuff, setShowDevStuff] = useState<boolean>(false);

  const changeSelected = (newSelected: NavigationItem) => {
    if (selected === newSelected) {
      setSelected('none');
    } else {
      setSelected(newSelected);
    }
  };

  const options: SelectOption[] = [
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
    { label: 'Option 3 is an option with a very long text', value: 'opt3' },
    { label: 'Option 4', value: 'opt4' },
    { label: 'Option 5', value: 'opt5' },
    { label: 'Option 6', value: 'opt6' },
    { label: 'Option 7', value: 'opt7' },
    { label: 'Option 8', value: 'opt8' },
    { label: 'Option 9', value: 'opt9' },
    { label: 'Option 10', value: 'opt10' },
    { label: 'Option 11', value: 'opt11' },
    { label: 'Option 12', value: 'opt12' },
    { label: 'Option 13', value: 'opt13' },
    { label: 'Option 14', value: 'opt14' },
    { label: 'Option 15', value: 'opt15' },
  ];

  const customRoundingMode = 'halfExpand';
  const customMinDecimals = 2;
  const customMaxDecimals = 4;

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
