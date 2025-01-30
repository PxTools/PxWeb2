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
import { getConfig } from './util/config/getConfig';
import { OpenAPI } from '@pxweb2/pxweb2-api-client';
import useAccessibility from './context/useAccessibility';
import useApp from './context/useApp';

export function App() {
  const { isTablet } = useApp();
  const config = getConfig();
  const accessibility = useAccessibility();
  OpenAPI.BASE = config.apiUrl;

  const { tableId } = useParams<{ tableId: string }>();
  const [selectedTableId] = useState(tableId ?? 'tab638');
  const [errorMsg] = useState('');
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>(isTablet ? 'none' : 'filter');
  const [hasFocus, setHasFocus] = useState<NavigationItem>('none');
  const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
  /**
   * Keep state if window screen size is mobile or desktop.
   */

  const navigationBarRef = useRef<{
    filter: HTMLButtonElement;
    view: HTMLButtonElement;
    edit: HTMLButtonElement;
    save: HTMLButtonElement;
    help: HTMLButtonElement;
  }>(null);

  const hideMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFocus !== 'none' && navigationBarRef.current) {
      hideMenuRef.current?.focus();
    }
  }, [hasFocus]);

  useEffect(() => {
    if (!navigationBarRef.current || !hideMenuRef.current) {
      return;
    }
    let item = null;

    if (selectedNavigationView === 'filter') {
      item = navigationBarRef.current.filter;
      accessibility.addFocusOverride(
        'filterButton',
        navigationBarRef.current.filter,
        undefined,
        hideMenuRef.current,
      );
    }

    if (selectedNavigationView === 'view') {
      item = navigationBarRef.current.view;
      accessibility.addFocusOverride(
        'viewButton',
        navigationBarRef.current.view,
        undefined,
        hideMenuRef.current,
      );
    }
    if (selectedNavigationView === 'edit') {
      item = navigationBarRef.current.edit;
      accessibility.addFocusOverride(
        'editButton',
        navigationBarRef.current.edit,
        undefined,
        hideMenuRef.current,
      );
    }
    if (selectedNavigationView === 'save') {
      item = navigationBarRef.current.save;
      accessibility.addFocusOverride(
        'saveButton',
        navigationBarRef.current.save,
        undefined,
        hideMenuRef.current,
      );
    }
    if (selectedNavigationView === 'help') {
      item = navigationBarRef.current.help;
      accessibility.addFocusOverride(
        'helpButton',
        navigationBarRef.current.help,
        undefined,
        hideMenuRef.current,
      );
    }

    if (item) {
      accessibility.addFocusOverride(
        'hideButton',
        hideMenuRef.current,
        item,
        undefined,
      );
    }
  }, [
    accessibility,
    navigationBarRef.current,
    hideMenuRef.current,
    selectedNavigationView,
  ]);

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
          navigationBarRef.current?.[
            newSelectedNavView as keyof typeof navigationBarRef.current
          ].focus();
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
      {!isTablet && <Header />}{' '}
      <div className={styles.navigationAndContentContainer}>
        {!isTablet && (
          <NavigationRail
            ref={navigationBarRef}
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
            hideMenuRef={hideMenuRef}
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
          ref={navigationBarRef}
          onChange={changeSelectedNavView}
          selected={selectedNavigationView}
        />
      )}{' '}
    </>
  );
}

export default App;
