/* import { useEffect, useRef } from 'react';
import { useAccessibility } from './AccessibilityProvider';

interface UseFocusableProps {
  id: string;
  order?: number;
}

export const useFocusable = ({ id, order = 0 }: UseFocusableProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { registerFocusable, unregisterFocusable } = useAccessibility();

  useEffect(() => {
    if (ref.current) {
      registerFocusable(id, ref.current, order);
    }

    return () => {
      unregisterFocusable(id);
    };
  }, [id, order]);

  return ref;
};
 */
