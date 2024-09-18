import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cl from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './app.module.scss';
import { ContentTop } from './components/ContentTop/ContentTop';
import { Selection } from './components/Selection/Selection';
import { Presentation } from './components/Presentation/Presentation';
import {
  PxTableMetadata,

  SelectedVBValues,

} from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';

import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import NavigationBar from './components/NavigationBar/NavigationBar';
import NavigationDrawer from './components/NavigationDrawer/NavigationDrawer';
import useVariables from './context/useVariables';
import useTableData from './context/useTableData';



export type NavigationItem =
  | 'none'
  | 'filter'
  | 'view'
  | 'edit'
  | 'save'
  | 'help';

export function App() {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const [selectedTableId, setSelectedTableId] = useState(
    tableId ? tableId : 'tab638'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>('filter');


  /**
   * Updates useState hook and synchronizes variables context with the selected VB values.
   *
   * @param selectedVBValues - An array of selected VB values.
   */


  useEffect(() => {
    if (errorMsg !== '') {
      console.error('ERROR: App.tsx:', errorMsg);
    }
  }, [errorMsg]);



  const changeSelectedNavView = (newSelectedNavView: NavigationItem) => {
    if (selectedNavigationView === newSelectedNavView) {
      setSelectedNavigationView('none');
    } else {
      setSelectedNavigationView(newSelectedNavView);
    }
  };

  useLocalizeDocumentAttributes();

 




  const drawerView = <>View content</>;
  const drawerEdit = <>Edit content</>;
  const drawerSave = <>Save content</>;
  const drawerHelp = <>Help content</>;
  console.log('selectedTableId=' + selectedTableId)

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
            <div className={styles.scrollable}>
              <NavigationDrawer
                heading={t('presentation_page.sidemenu.selection.title')}
                onClose={() => {
                  setSelectedNavigationView('none');
                }}
              >
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
                <Selection selectedNavigationView={selectedNavigationView} selectedTabId={selectedTableId}  />
                {/* {selectedNavigationView === 'filter' && drawerFilter}
                {selectedNavigationView === 'view' && drawerView}
                {selectedNavigationView === 'edit' && drawerEdit}
                {selectedNavigationView === 'save' && drawerSave}
                {selectedNavigationView === 'help' && drawerHelp} */}
              </NavigationDrawer>
            </div>
          )}
        </div>
        <div className={cl(styles.mobileNavigation, styles.scrollable)}>
          <NavigationBar
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        </div>
        {/* { pxTableMetadata  && <Presentation pxTablemetaData={pxTableMetadata} selectedNavigationView={selectedNavigationView} isMissingMandatoryVariables={isMissingMandatoryVariables} isLoadingMetadata={isLoadingMetadata} ></Presentation>} */}        
        { <Presentation selectedTabId={selectedTableId}  selectedNavigationView={selectedNavigationView}  ></Presentation>}
        {/* <div className={styles.scrollable}>
          <Content topLeftBorderRadius={selectedNavigationView === 'none'}>
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
                    svgName="ManWithMagnifyingGlass"
                    headingTxt={t(
                      'presentation_page.main_content.table.warnings.missing_mandatory.title'
                    )}
                    descriptionTxt={t(
                      'presentation_page.main_content.table.warnings.missing_mandatory.description'
                    )}
                  />
                )}
              </>
            )}{' '}
          </Content>
        </div> */}
      </div>
    </>
  );
}

export default App;
