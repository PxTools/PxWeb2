import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface FocusableElement {
  id: string;
  ref: HTMLElement;
  order: number;
}

interface AccessibilityContextType {
  registerFocusable: (id: string, element: HTMLElement, order?: number) => void;
  unregisterFocusable: (id: string) => void;
  updateFocusOrder: (id: string, newOrder: number) => void;
  closeModals: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null,
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider = ({
  children,
}: AccessibilityProviderProps) => {
  const [focusableElements, setFocusableElements] = useState<
    FocusableElement[]
  >([]);
  const [openModals, setOpenModals] = useState<string[]>([]);

  const registerFocusable = (id: string, element: HTMLElement, order = 0) => {
    setFocusableElements((prev) =>
      [...prev, { id, ref: element, order }].sort((a, b) => a.order - b.order),
    );
  };

  const unregisterFocusable = (id: string) => {
    setFocusableElements((prev) => prev.filter((element) => element.id !== id));
  };

  const updateFocusOrder = (id: string, newOrder: number) => {
    setFocusableElements((prev) =>
      prev
        .map((element) =>
          element.id === id ? { ...element, order: newOrder } : element,
        )
        .sort((a, b) => a.order - b.order),
    );
  };

  const closeModals = () => {
    setOpenModals([]);
    // You might want to emit an event or call a callback here
    // to let modal components know they should close
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModals();
      }

      if (event.key === 'Tab') {
        const focusableRefs = focusableElements.map((el) => el.ref);
        const currentIndex = focusableRefs.indexOf(
          document.activeElement as HTMLElement,
        );

        if (event.shiftKey) {
          if (currentIndex <= 0) {
            event.preventDefault();
            focusableRefs[focusableRefs.length - 1]?.focus();
          }
        } else if (currentIndex === focusableRefs.length - 1) {
          event.preventDefault();
          focusableRefs[0]?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [focusableElements]);

  const value = {
    registerFocusable,
    unregisterFocusable,
    updateFocusOrder,
    closeModals,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);

  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider',
    );
  }

  return context;
};
