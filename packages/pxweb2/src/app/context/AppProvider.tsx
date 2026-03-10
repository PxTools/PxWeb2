import React, { createContext, useState, useEffect, useMemo } from 'react';

import {
  BreakpointsXsmallMaxWidth,
  BreakpointsSmallMaxWidth,
  BreakpointsMediumMaxWidth,
  BreakpointsLargeMaxWidth,
  BreakpointsXlargeMaxWidth,
} from '@pxweb2/pxweb2-ui';

// Define the type for the context
export type AppContextType = {
  getSavedQueryId: () => string;
  isInitialized: boolean;
  isXLargeDesktop: boolean;
  isXXLargeDesktop: boolean;
  isTablet: boolean;
  isSmallTablet: boolean;
  isMobile: boolean;
  skipToMainFocused: boolean;
  setSkipToMainFocused: (focused: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  hidePageScrollbar: boolean;
  selectionWantsToHidePageScrollbar: boolean;
  setSelectionWantsToHidePageScrollbar: (hide: boolean) => void;
  tableInformationWantsToHidePageScrollbar: boolean;
  setTableInformationWantsToHidePageScrollbar: (hide: boolean) => void;
};

// Create the context with default values
export const AppContext = createContext<AppContextType>({
  getSavedQueryId: () => '',
  isInitialized: false,
  isXLargeDesktop: false,
  isXXLargeDesktop: false,
  isTablet: false,
  isSmallTablet: false,
  isMobile: false,
  skipToMainFocused: false,
  setSkipToMainFocused: () => {
    return;
  },
  title: '',
  setTitle: () => {
    return;
  },
  hidePageScrollbar: false,
  selectionWantsToHidePageScrollbar: false,
  setSelectionWantsToHidePageScrollbar: () => {
    return;
  },
  tableInformationWantsToHidePageScrollbar: false,
  setTableInformationWantsToHidePageScrollbar: () => {
    return;
  },
});

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized] = useState(true);
  const [skipToMainFocused, setSkipToMainFocused] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [
    selectionWantsToHidePageScrollbar,
    setSelectionWantsToHidePageScrollbar,
  ] = useState(false);
  const [
    tableInformationWantsToHidePageScrollbar,
    setTableInformationWantsToHidePageScrollbar,
  ] = useState(false);
  const hidePageScrollbar =
    selectionWantsToHidePageScrollbar ||
    tableInformationWantsToHidePageScrollbar;

  /**
   * Keep state if window screen size is mobile, small tablet, tablet, or desktop.
   */
  const largeBreakpoint = Number(BreakpointsLargeMaxWidth.replace('px', ''));
  const xLargeBreakpoint = Number(BreakpointsXlargeMaxWidth.replace('px', ''));
  const tabletBreakpoint = Number(BreakpointsMediumMaxWidth.replace('px', ''));
  const smallTabletBreakpoint = Number(
    BreakpointsSmallMaxWidth.replace('px', ''),
  );
  const mobileBreakpoint = Number(BreakpointsXsmallMaxWidth.replace('px', ''));
  const [isXLargeDesktop, setIsXLargeDesktop] = useState(
    window.innerWidth > largeBreakpoint,
  );
  const [isXXLargeDesktop, setIsXXLargeDesktop] = useState(
    window.innerWidth > xLargeBreakpoint,
  );
  const [isTablet, setIsTablet] = useState(
    window.innerWidth <= tabletBreakpoint,
  );
  const [isSmallTablet, setIsSmallTablet] = useState(
    window.innerWidth <= smallTabletBreakpoint,
  );
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= mobileBreakpoint,
  );

  useEffect(() => {
    document.body.classList.toggle('hide-scrollbar', hidePageScrollbar);

    return () => {
      document.body.classList.remove('hide-scrollbar');
    };
  }, [hidePageScrollbar]);

  // Use effect to set the isMobile and isTablet state
  useEffect(() => {
    const handleResize = () => {
      setIsXLargeDesktop(window.innerWidth > largeBreakpoint);
      setIsXXLargeDesktop(window.innerWidth > xLargeBreakpoint);
      setIsTablet(window.innerWidth <= tabletBreakpoint);
      setIsSmallTablet(window.innerWidth <= smallTabletBreakpoint);
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    mobileBreakpoint,
    tabletBreakpoint,
    smallTabletBreakpoint,
    largeBreakpoint,
    xLargeBreakpoint,
  ]);

  const getSavedQueryId = React.useCallback(() => {
    let savedQueryId: string = '';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('sq')) {
        savedQueryId = params.get('sq') ?? '';
      }
    }
    return savedQueryId;
  }, []);

  const cachedValues = useMemo(
    () => ({
      getSavedQueryId,
      isInitialized,
      isXLargeDesktop,
      isXXLargeDesktop,
      isTablet,
      isSmallTablet,
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
      title,
      setTitle,
      hidePageScrollbar,
      selectionWantsToHidePageScrollbar,
      setSelectionWantsToHidePageScrollbar,
      tableInformationWantsToHidePageScrollbar,
      setTableInformationWantsToHidePageScrollbar,
    }),
    [
      getSavedQueryId,
      isInitialized,
      isXLargeDesktop,
      isXXLargeDesktop,
      isTablet,
      isSmallTablet,
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
      title,
      setTitle,
      hidePageScrollbar,
      selectionWantsToHidePageScrollbar,
      setSelectionWantsToHidePageScrollbar,
      tableInformationWantsToHidePageScrollbar,
      setTableInformationWantsToHidePageScrollbar,
    ],
  );

  return (
    <AppContext.Provider value={cachedValues}>{children}</AppContext.Provider>
  );
};
