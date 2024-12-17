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
import {
  BreakpointsSmallMaxWidth,
  BreakpointsXsmallMaxWidth,
} from '@pxweb2/pxweb2-ui';
import { getConfig } from './util/config/getConfig';
import { OpenAPI } from '@pxweb2/pxweb2-api-client';

export function App() {
  const config = getConfig();
  OpenAPI.BASE = config.apiUrl;

  const { tableId } = useParams<{ tableId: string }>();
  const [selectedTableId, setSelectedTableId] = useState(
    tableId ? tableId : 'tab638',
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>('filter');

  /**
   * Keep state if window screen size is a small device (mobile or pad).
   */
  const smallBreakpoint = Number(BreakpointsSmallMaxWidth.replace('px', ''));
  const [isSmallDevice, setIsSmallDevice] = useState(
    window.innerWidth <= smallBreakpoint,
  );

  /**
   * Keep state if window screen size is a xsmall device (mobile).
   */
  const xSmallBreakpoint = Number(BreakpointsXsmallMaxWidth.replace('px', ''));
  const [isXSmallDevice, setIsXSmallDevice] = useState(
    window.innerWidth <= xSmallBreakpoint,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsSmallDevice(window.innerWidth <= smallBreakpoint);
      setIsXSmallDevice(window.innerWidth <= xSmallBreakpoint);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [smallBreakpoint]);

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
      {!isSmallDevice && <Header />}{' '}
      <div className={styles.navigationAndContentContainer}>
        {!isSmallDevice && (
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
            {isSmallDevice && <Header />}{' '}
            <Presentation
              selectedTabId={selectedTableId}
              isMobile={isXSmallDevice}
            ></Presentation>
            <Footer />
          </div>
        </div>
      </div>
      {isSmallDevice && (
        <NavigationBar
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
      )}{' '}
    </>
  );
}

export default App;
