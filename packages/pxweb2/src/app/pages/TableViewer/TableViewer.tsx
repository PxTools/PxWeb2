import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import cl from 'clsx';

import styles from './TableViewer.module.scss';
import { Selection } from '../../components/Selection/Selection';
import { Presentation } from '../../components/Presentation/Presentation';
import { Header } from '../../components/Header/Header';
import { NavigationItem } from '../../components/NavigationMenu/NavigationItem/NavigationItemType';
import NavigationRail from '../../components/NavigationMenu/NavigationRail/NavigationRail';
import NavigationBar from '../../components/NavigationMenu/NavigationBar/NavigationBar';
import { SkipToMain } from '../../components/SkipToMain/SkipToMain';
import { Footer } from '../../components/Footer/Footer';
import { getConfig } from '../../util/config/getConfig';
import { OpenAPI } from '@pxweb2/pxweb2-api-client';
import useApp from '../../context/useApp';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { VariablesProvider } from '../../context/VariablesProvider';
import { TableDataProvider } from '../../context/TableDataProvider';

export function TableViewer() {
  const {
    isMobile,
    isTablet,
    isXLargeDesktop,
    skipToMainFocused,
    setSkipToMainFocused,
  } = useApp();
  const config = getConfig();

  const baseUrl = config.apiUrl;
  OpenAPI.BASE = baseUrl;

  const { tableId } = useParams<{ tableId: string }>();
  const [selectedTableId] = useState(tableId ?? '');
  const [selectedNavigationView, setSelectedNavigationView] =
    useState<NavigationItem>(isXLargeDesktop ? 'selection' : 'none');
  const [hasFocus, setHasFocus] = useState<NavigationItem>('none');
  const [openedWithKeyboard, setOpenedWithKeyboard] = useState(false);
  const outerContainerRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationBarRef = useRef<{
    selection: HTMLButtonElement;
    view: HTMLButtonElement;
    edit: HTMLButtonElement;
    save: HTMLButtonElement;
    help: HTMLButtonElement;
  }>(null);

  const hideMenuRef = useRef<HTMLButtonElement>(null);
  const skipToMainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFocus !== 'none' && navigationBarRef.current) {
      hideMenuRef.current?.focus();
    }
  }, [hasFocus]);

  // Drawer focus-trap is implemented inside NavigationDrawer via portal

  // Monitor focus on SkipToMain
  useEffect(() => {
    const skipElement = skipToMainRef.current;
    if (!skipElement) {
      return;
    }

    const handleFocus = () => setSkipToMainFocused(true);
    const handleBlur = () => setSkipToMainFocused(false);

    skipElement.addEventListener('focusin', handleFocus);
    skipElement.addEventListener('focusout', handleBlur);

    return () => {
      skipElement.removeEventListener('focusin', handleFocus);
      skipElement.removeEventListener('focusout', handleBlur);
    };
  }, [setSkipToMainFocused]);

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

  const isSmallScreen = isTablet === true || isMobile === true;

  return (
    <>
      <SkipToMain ref={skipToMainRef} />
      {!isSmallScreen && <Header />}
      {/* tabindex={-1} to fix firefox focusing this div*/}
      <div
        ref={isSmallScreen ? outerContainerRef : undefined}
        className={styles.navigationAndContentContainer}
        tabIndex={-1}
      >
        {isSmallScreen ? (
          <>
            <Header stroke={true} />
            <NavigationBar
              ref={navigationBarRef}
              onChange={changeSelectedNavView}
              selected={selectedNavigationView}
            />
          </>
        ) : (
          <NavigationRail
            ref={navigationBarRef}
            onChange={changeSelectedNavView}
            selected={selectedNavigationView}
          />
        )}{' '}
        <div
          data-drawer-root
          className={cl(styles.mainContainer, {
            [styles.skipToMainContentVisible]: skipToMainFocused,
          })}
        >
          <Selection
            selectedNavigationView={selectedNavigationView}
            selectedTabId={selectedTableId}
            setSelectedNavigationView={changeSelectedNavView}
            openedWithKeyboard={openedWithKeyboard}
            hideMenuRef={hideMenuRef}
          />
          <div
            ref={!isSmallScreen ? outerContainerRef : undefined}
            className={cl(styles.contentAndFooterContainer, {
              [styles.expanded]: isExpanded,
            })}
          >
            <Presentation
              scrollRef={outerContainerRef}
              selectedTabId={selectedTableId}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            ></Presentation>
            <Footer containerRef={outerContainerRef} variant="tableview" />
          </div>
        </div>
      </div>
    </>
  );
}

function Render() {
  return (
    <AccessibilityProvider>
      <VariablesProvider>
        <TableDataProvider>
          <TableViewer />
        </TableDataProvider>
      </VariablesProvider>
    </AccessibilityProvider>
  );
}

export default Render;
