import { useContext } from 'react';
import { AccessibilityContext } from './AccessibilityProvider';

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider',
    );
  }

  return context;
};

export default useAccessibility;
