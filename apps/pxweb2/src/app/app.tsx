import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import cl from 'clsx';
import { useNavigate, useParams } from 'react-router-dom';

import styles from './app.module.scss';
// import { ContentTop } from './components/ContentTop/ContentTop';
import { Selection } from './components/Selection/Selection';
import { Presentation } from './components/Presentation/Presentation';
// import { PxTableMetadata, SelectedVBValues } from '@pxweb2/pxweb2-ui';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';

import { Header } from './components/Header/Header';
import NavigationRail from './components/NavigationRail/NavigationRail';
import NavigationBar from './components/NavigationBar/NavigationBar';
// import NavigationDrawer from './components/NavigationDrawer/NavigationDrawer';
// import useVariables from './context/useVariables';
// import useTableData from './context/useTableData';

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






  
  return (
    <>
      <Header />
      <div className={styles.main}>
        <div className={styles.desktopNavigation}>
          <NavigationRail
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
          <Selection
            selectedNavigationView={selectedNavigationView}
            selectedTabId={selectedTableId}
            setSelectedNavigationView={changeSelectedNavView}
            setSelectedTableId={setSelectedTableId}
          />
        </div>
        <div className={cl(styles.mobileNavigation, styles.scrollable)}>
          <NavigationBar
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        </div>
        {
          <Presentation
            selectedTabId={selectedTableId}
            selectedNavigationView={selectedNavigationView}
          ></Presentation>
        }
        {}
      </div>
    </>
  );
}

export default App;
