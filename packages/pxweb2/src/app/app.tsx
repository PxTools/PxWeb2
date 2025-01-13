import { useEffect, useState, useRef } from 'react';
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
import { BreakpointsSmallMaxWidth } from '@pxweb2/pxweb2-ui';
import { getConfig } from './util/config/getConfig';
import { OpenAPI } from '@pxweb2/pxweb2-api-client';
import { set } from 'lodash';

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
  const [hasFocus, setHasFocus] = useState<NavigationItem>('none');
  const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
  /**
   * Keep state if window screen size is mobile or desktop.
   */
  const mobileBreakpoint = Number(BreakpointsSmallMaxWidth.replace('px', ''));
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= mobileBreakpoint,
  );

  const navigationRailRef = useRef<{
    filter: HTMLButtonElement;
    view: HTMLButtonElement;
    edit: HTMLButtonElement;
    save: HTMLButtonElement;
    help: HTMLButtonElement;
  }>(null);

  const navigationBarRef = useRef<{
    filter: HTMLButtonElement;
    view: HTMLButtonElement;
    edit: HTMLButtonElement;
    save: HTMLButtonElement;
    help: HTMLButtonElement;
  }>(null);

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

  const changeSelectedNavView = (
    keyboard: boolean,
    close: boolean,
    newSelectedNavView: NavigationItem,
  ) => {
    if (close && keyboard) {
      if (newSelectedNavView !== 'none') {
        window.setTimeout(() => {
          // Sorry about this hack, can't justify spending more time on this
          navigationRailRef.current?.[newSelectedNavView].focus();
          navigationBarRef.current?.[newSelectedNavView].focus();
        }, 100);
      }
      setSelectedNavigationView('none');
      return;
    }

    if (close && !keyboard) {
      setSelectedNavigationView('none');
      setHasFocus('none');
      return;
    }

    if (!close && keyboard) {
      setOpenedWithKeyboard(true);
      setSelectedNavigationView(newSelectedNavView);
      setHasFocus(newSelectedNavView);
      return;
    }

    if (!close && !keyboard) {
      setOpenedWithKeyboard(false);
      setHasFocus(newSelectedNavView);
      setSelectedNavigationView(newSelectedNavView);
    }
  };
  useLocalizeDocumentAttributes();

  return (
    <>
      <SkipToMain />
      {!isMobile && <Header />}{' '}
      <div className={styles.navigationAndContentContainer}>
        {!isMobile && (
          <NavigationRail
            ref={navigationRailRef}
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        )}{' '}
        <div className={styles.mainContainer}>
          <Selection
            selectedNavigationView={selectedNavigationView}
            selectedTabId={selectedTableId}
            setSelectedNavigationView={changeSelectedNavView}
            openedWithKeyboard={openedWithKeyboard}
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
          ref={navigationBarRef}
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
      )}{' '}
    </>
  );
}

export default App;
