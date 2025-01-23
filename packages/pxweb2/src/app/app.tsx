import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import styles from './app.module.scss';
import { Selection } from './components/Selection/Selection';
import { Presentation } from './components/Presentation/Presentation';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
import { Header } from './components/Header/Header';
import { NavigationItem } from './components/NavigationMenu/NavigationItem/NavigationItemType';
import NavigationRail from './components/NavigationMenu/NavigationRail/NavigationRail';
import NavigationBar from './components/NavigationMenu/NavigationBar/NavigationBar';
import { SkipToMain } from './components/SkipToMain/SkipToMain';
import { Footer } from './components/Footer/Footer';
import { getConfig } from './util/config/getConfig';
import { OpenAPI } from '@pxweb2/pxweb2-api-client';
import useApp from './context/useApp';

export function App() {
  const { isTablet } = useApp();
  const config = getConfig();
  OpenAPI.BASE = config.apiUrl;

  const { tableId } = useParams<{ tableId: string }>();
  const [selectedTableId] = useState(tableId ?? '04534');
  const [errorMsg] = useState('');
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>(isTablet ? 'none' : 'filter');

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
      <SkipToMain />
      {!isTablet && <Header />}{' '}
      <div className={styles.navigationAndContentContainer}>
        {!isTablet && (
          <NavigationRail
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        )}{' '}
        <div className={styles.mainContainer}>
          <Selection
            selectedNavigationView={selectedNavigationView}
            selectedTabId={selectedTableId}
            setSelectedNavigationView={changeSelectedNavView}
          />
          <div className={styles.contentAndFooterContainer}>
            {isTablet && <Header />}{' '}
            <Presentation selectedTabId={selectedTableId}></Presentation>
            <Footer />
          </div>
        </div>
      </div>
      {isTablet && (
        <NavigationBar
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
      )}{' '}
    </>
  );
}

export default App;
