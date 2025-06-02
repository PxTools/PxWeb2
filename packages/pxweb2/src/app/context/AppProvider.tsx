import React, { createContext, useState, useEffect, useMemo } from 'react';

import {
  BreakpointsXsmallMaxWidth,
  BreakpointsMediumMaxWidth,
} from '@pxweb2/pxweb2-ui';

// Define the type for the context
export type AppContextType = {
  isInitialized: boolean;
  isTablet: boolean;
  isMobile: boolean;
  skipToMainFocused: boolean;
  setSkipToMainFocused: (focused: boolean) => void;
};

// Create the context with default values
export const AppContext = createContext<AppContextType>({
  isInitialized: false,
  isTablet: false,
  isMobile: false,
  skipToMainFocused: false,
  setSkipToMainFocused: () => {
    return;
  },
});

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized] = useState(true);
  const [skipToMainFocused, setSkipToMainFocused] = useState(false);

  /**
   * Keep state if window screen size is mobile, pad or desktop.
   */
  const tabletBreakpoint = Number(BreakpointsMediumMaxWidth.replace('px', ''));
  const mobileBreakpoint = Number(BreakpointsXsmallMaxWidth.replace('px', ''));
  const [isTablet, setIsTablet] = useState(
    window.innerWidth <= tabletBreakpoint,
  );
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= mobileBreakpoint,
  );

  // Use effect to set the isMobile and isTablet state
  useEffect(() => {
    const handleResize = () => {
      setIsTablet(window.innerWidth <= tabletBreakpoint);
      setIsMobile(window.innerWidth <= mobileBreakpoint);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileBreakpoint, tabletBreakpoint]);

  const cachedValues = useMemo(
    () => ({
      isInitialized,
      isTablet,
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
    }),
    [
      isInitialized,
      isTablet,
      isMobile,
      skipToMainFocused,
      setSkipToMainFocused,
    ],
  );

  return (
    <AppContext.Provider value={cachedValues}>{children}</AppContext.Provider>
  );
};
