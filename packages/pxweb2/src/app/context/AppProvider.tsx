import React, { createContext, useState, useEffect, useMemo } from 'react';

import {
  BreakpointsXsmallMaxWidth,
  BreakpointsSmallMaxWidth,
  BreakpointsMediumMaxWidth,
  BreakpointsLargeMaxWidth,
  BreakpointsXlargeMaxWidth,
  ScreenSize
} from '@pxweb2/pxweb2-ui';

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

const getScreenSize = (
  width: number,
  xLargeBreakpoint: number,
  largeBreakpoint: number,
  tabletBreakpoint: number,
  smallBreakpoint: number,
  mobileBreakpoint: number,
): ScreenSize => {
  if (width > xLargeBreakpoint) {
    return 'xxlarge';
  }
  if (width > largeBreakpoint) {
    return 'xlarge';
  }
  if (width > tabletBreakpoint) {
    return 'large';
  }
  if (width > smallBreakpoint) {
    return 'medium';
  }
  if (width > mobileBreakpoint) {
    return 'small';
  }
  return 'xsmall';
};

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
    getScreenSize(
      window.innerWidth,
      xLargeBreakpoint,
      largeBreakpoint,
      tabletBreakpoint,
      smallBreakpoint,
      mobileBreakpoint,
    ),
  );

  // Use effect to set the isMobile and isTablet state
  useEffect(() => {
    const handleResize = () => {
      setIsXLargeDesktop(window.innerWidth > largeBreakpoint);
      setIsXXLargeDesktop(window.innerWidth > xLargeBreakpoint);
      setIsTablet(window.innerWidth <= tabletBreakpoint);
      setIsMobile(window.innerWidth <= mobileBreakpoint);
      setScreenSize(
        getScreenSize(
          window.innerWidth,
          xLargeBreakpoint,
          largeBreakpoint,
          tabletBreakpoint,
          smallBreakpoint,
          mobileBreakpoint,
        ),
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
