import React, { createContext, useState, useEffect, useMemo } from 'react';

import {
  BreakpointsXsmallMaxWidth,
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
  isMobile: boolean;
  skipToMainFocused: boolean;
  setSkipToMainFocused: (focused: boolean) => void;
  skipToFilterFocused: boolean;
  setSkipToFilterFocused: (focused: boolean) => void;
  skipToResultFocused: boolean;
  setSkipToResultFocused: (focused: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
};

// Create the context with default values
export const AppContext = createContext<AppContextType>({
  getSavedQueryId: () => '',
  isInitialized: false,
  isXLargeDesktop: false,
  isXXLargeDesktop: false,
  isTablet: false,
  isMobile: false,
  skipToMainFocused: false,
  setSkipToMainFocused: () => {
    return;
  },
  skipToFilterFocused: false,
  setSkipToFilterFocused: () => {
    return;
  },
  skipToResultFocused: false,
  setSkipToResultFocused: () => {
    return;
  },
  title: '',
  setTitle: () => {
    return;
  },
});

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized] = useState(true);
  const [skipToMainFocused, setSkipToMainFocused] = useState(false);
  const [skipToFilterFocused, setSkipToFilterFocused] = useState(false);
  const [skipToResultFocused, setSkipToResultFocused] = useState(false);
  const [title, setTitle] = useState<string>('');

  /**
   * Keep state if window screen size is mobile, pad or desktop.
   */
  const largeBreakpoint = Number(BreakpointsLargeMaxWidth.replace('px', ''));
  const xLargeBreakpoint = Number(BreakpointsXlargeMaxWidth.replace('px', ''));
  const tabletBreakpoint = Number(BreakpointsMediumMaxWidth.replace('px', ''));
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
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= mobileBreakpoint,
  );

  // Use effect to set the isMobile and isTablet state
  useEffect(() => {
    const handleResize = () => {
      setIsXLargeDesktop(window.innerWidth > largeBreakpoint);
      setIsXXLargeDesktop(window.innerWidth > xLargeBreakpoint);
      setIsTablet(window.innerWidth <= tabletBreakpoint);
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint, tabletBreakpoint, largeBreakpoint, xLargeBreakpoint]);

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
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
      skipToFilterFocused,
      setSkipToFilterFocused,
      skipToResultFocused,
      setSkipToResultFocused,
      title,
      setTitle,
    }),
    [
      getSavedQueryId,
      isInitialized,
      isXLargeDesktop,
      isXXLargeDesktop,
      isTablet,
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
      skipToFilterFocused,
      setSkipToFilterFocused,
      skipToResultFocused,
      setSkipToResultFocused,
      title,
      setTitle,
    ],
  );

  return (
    <AppContext.Provider value={cachedValues}>{children}</AppContext.Provider>
  );
};
