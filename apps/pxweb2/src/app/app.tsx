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

import { NavigationItem } from './components/NavigationMenu/NavigationItem/NavigationItemType';
import NavigationRail from './components/NavigationMenu/NavigationRail/NavigationRail';
import NavigationBar from './components/NavigationMenu/NavigationBar/NavigationBar';

import { Footer } from './components/Footer/Footer';

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
      <div className={styles.navigationAndContentContainer}>
        <NavigationRail
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
        <div className={styles.mainContainer}>
          <Selection
            selectedNavigationView={selectedNavigationView}
            selectedTabId={selectedTableId}
            setSelectedNavigationView={changeSelectedNavView}
            setSelectedTableId={setSelectedTableId}
          />
          <div className={styles.contentAndFooterContainer}>
            <div className={styles.contentContainer}>
              <Presentation
                selectedTabId={selectedTableId}
                selectedNavigationView={selectedNavigationView}
              ></Presentation>
            </div>
            <Footer />
          </div>
        </div>
      </div>
      <NavigationBar
        onChange={changeSelectedNavView}
        selected={selectedNavigationView}
      />
    </>
  );
}

export default App;
