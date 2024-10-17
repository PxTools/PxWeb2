import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './app.module.scss';
import { Selection } from './components/Selection/Selection';
import { Presentation } from './components/Presentation/Presentation';
import useLocalizeDocumentAttributes from '../i18n/useLocalizeDocumentAttributes';
import { Header } from './components/Header/Header';
import { NavigationItem } from './components/NavigationMenu/NavigationItem/NavigationItemType';
import NavigationRail from './components/NavigationMenu/NavigationRail/NavigationRail';
import NavigationBar from './components/NavigationMenu/NavigationBar/NavigationBar';

import { Footer } from './components/Footer/Footer';
import { BreakpointsSmallMaxWidth } from '@pxweb2/pxweb2-ui';
import { getConfig } from './util/config/getConfig';
import { OpenAPI } from '@pxweb2/pxweb2-api-client';

export function App() {
  const config = getConfig();
  OpenAPI.BASE = config.apiUrl;

  const { tableId } = useParams<{ tableId: string }>();
  const [selectedTableId, setSelectedTableId] = useState(
    tableId ? tableId : 'tab638'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>('filter');

  /**
   * Keep state if window screen size is mobile or desktop.
   */
  const mobileBreakpoint = Number(BreakpointsSmallMaxWidth.replace('px', ''));
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= mobileBreakpoint
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint]);

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
      {!isMobile && <Header />}{' '}
      <div className={styles.navigationAndContentContainer}>
        {!isMobile && (
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
            {isMobile && <Header />}{' '}
            <Presentation selectedTabId={selectedTableId}></Presentation>
            <Footer />
          </div>
        </div>
      </div>
      {isMobile && (
        <NavigationBar
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
      )}{' '}
    </>
  );
}

export default App;
