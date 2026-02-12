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
import useAccessibility from '../../context/useAccessibility';
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
    const accessibility = useAccessibility();

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

  const isSmallScreen = isTablet === true || isMobile === true;


  useEffect(() => {
    if (hasFocus !== 'none' && navigationBarRef.current) {
      hideMenuRef.current?.focus();
    }
  }, [hasFocus]);

  useEffect(() => {
    if (isSmallScreen) {return};
    if (!navigationBarRef.current || !hideMenuRef.current) {
      return;
    }
    let item = null;

    if (selectedNavigationView === 'selection') {
      item = navigationBarRef.current.selection;
      accessibility.addFocusOverride(
        'selectionButton',
        navigationBarRef.current.selection,
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
  }, [accessibility, selectedNavigationView, isSmallScreen]);

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
          {...(isSmallScreen ? { 'data-drawer-root': true } : {})}
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
