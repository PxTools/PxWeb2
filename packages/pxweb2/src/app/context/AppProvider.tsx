import React, { createContext, useState, useEffect } from 'react';

import {
  BreakpointsSmallMaxWidth,
  BreakpointsXsmallMaxWidth,
} from '@pxweb2/pxweb2-ui';

// Define the type for the context
export type AppContextType = {
  isInitialized: boolean;
  isTablet: boolean;
  isMobile: boolean;
};

// Create the context with default values
export const AppContext = createContext<AppContextType>({
  isInitialized: false,
  isTablet: false,
  isMobile: false,
});

// Provider component
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized] = useState(true);

  /**
   * Keep state if window screen size is mobile, pad or desktop.
   */
  const tabletBreakpoint = Number(BreakpointsSmallMaxWidth.replace('px', ''));
  const mobileBreakpoint = Number(BreakpointsXsmallMaxWidth.replace('px', ''));
  const [isTablet, setIsTablet] = useState(
    window.innerWidth <= tabletBreakpoint,
  );
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= mobileBreakpoint,
  );

  // Use effect to set the isMobile state
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

  return (
    <AppContext.Provider
      value={{
        isInitialized,
        isTablet,
        isMobile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
