import React, { createContext, useState, useEffect, useMemo } from 'react';

import {
  BreakpointsXsmallMaxWidth,
  BreakpointsSmallMaxWidth,
  BreakpointsMediumMaxWidth,
  BreakpointsLargeMaxWidth,
  BreakpointsXlargeMaxWidth,
} from '@pxweb2/pxweb2-ui';
import ScreenSize from 'packages/pxweb2-ui/src/lib/types/screenSize';

// Define the type for the context
export type AppContextType = {
  getSavedQueryId: () => string;
  isInitialized: boolean;
  isXLargeDesktop: boolean;
  isXXLargeDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  screenSize: ScreenSize;
  skipToMainFocused: boolean;
  setSkipToMainFocused: (focused: boolean) => void;
  title: string;
  setTitle: (title: string) => void;
  languageFilter: string[];
  setLanguageFilter: (languages: string[]) => void;
};

// Create the context with default values
export const AppContext = createContext<AppContextType>({
  getSavedQueryId: () => '',
  isInitialized: false,
  isXLargeDesktop: false,
  isXXLargeDesktop: false,
  isTablet: false,
  isMobile: false,
  screenSize: 'large',
  skipToMainFocused: false,
  setSkipToMainFocused: () => {
    return;
  },
  title: '',
  setTitle: () => {
    return;
  },
  languageFilter: [],
  setLanguageFilter: () => {
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
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  /**
   * Keep state if window screen size is mobile, tablet, or desktop.
   */
  const xLargeBreakpoint = Number(BreakpointsXlargeMaxWidth.replace('px', ''));
  const largeBreakpoint = Number(BreakpointsLargeMaxWidth.replace('px', ''));
  const tabletBreakpoint = Number(BreakpointsMediumMaxWidth.replace('px', ''));
  const smallBreakpoint = Number(BreakpointsSmallMaxWidth.replace('px', ''));
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
  const [screenSize, setScreenSize] = useState<ScreenSize>(
    window.innerWidth > xLargeBreakpoint
      ? 'xxlarge'
      : window.innerWidth > largeBreakpoint
        ? 'xlarge'
        : window.innerWidth > tabletBreakpoint
          ? 'large'
          : window.innerWidth > smallBreakpoint
            ? 'medium'
            : window.innerWidth > mobileBreakpoint
              ? 'small'
              : 'xsmall',
  );

  // Use effect to set the isMobile and isTablet state
  useEffect(() => {
    const handleResize = () => {
      setIsXLargeDesktop(window.innerWidth > largeBreakpoint);
      setIsXXLargeDesktop(window.innerWidth > xLargeBreakpoint);
      setIsTablet(window.innerWidth <= tabletBreakpoint);
      setIsMobile(window.innerWidth <= mobileBreakpoint);
      setScreenSize(
        window.innerWidth > xLargeBreakpoint
          ? 'xxlarge'
          : window.innerWidth > largeBreakpoint
            ? 'xlarge'
            : window.innerWidth > tabletBreakpoint
              ? 'large'
              : window.innerWidth > smallBreakpoint
                ? 'medium'
                : window.innerWidth > mobileBreakpoint
                  ? 'small'
                  : 'xsmall',
      );
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    mobileBreakpoint,
    tabletBreakpoint,
    largeBreakpoint,
    xLargeBreakpoint,
    smallBreakpoint,
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
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
      title,
      setTitle,
      screenSize,
      languageFilter,
      setLanguageFilter,
    }),
    [
      getSavedQueryId,
      isInitialized,
      isXLargeDesktop,
      isXXLargeDesktop,
      isTablet,
      isMobile,
      screenSize,
      skipToMainFocused,
      setSkipToMainFocused,
      title,
      setTitle,
      languageFilter,
      setLanguageFilter,
    ],
  );

  return (
    <AppContext.Provider value={cachedValues}>{children}</AppContext.Provider>
  );
};
