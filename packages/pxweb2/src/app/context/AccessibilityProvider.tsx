import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from 'react';

interface FocusableElement {
  id: string;
  ref: HTMLElement;
  order: number;
}

interface AccessibilityContextType {
  addModal: (name: string, closeFunction: () => void) => void;
  closeModal: () => void;
  removeModal: (name: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null,
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * AccessibilityProvider makes it easier to handle which modal should be closed when pressing escape.
 * It also makes it easier to handle focus order for focusable elements.
 * If there are focusable elements it will override the default focus order and use the current order until the end of the order.
 */

export const AccessibilityProvider = ({
  children,
}: AccessibilityProviderProps) => {
  const [focusableElements, setFocusableElements] = useState<
    FocusableElement[]
  >([]);
  const [modals, setModals] = useState<
    {
      name: string;
      closeFunction: () => void;
    }[]
  >([]);

  const closeModal = React.useCallback(() => {
    setModals((prev) => {
      if (prev.length === 0) return prev;
      prev[prev.length - 1].closeFunction();
      return prev.slice(0, -1);
    });
  }, []);

  const removeModal = React.useCallback((name: string) => {
    setModals((prev) => prev.filter((modal) => modal.name !== name));
  }, []);

  const addModal = React.useCallback(
    (name: string, closeFunction: () => void) => {
      setModals((prev) => {
        const filteredModals = prev.filter((modal) => modal.name !== name);
        return [...filteredModals, { name, closeFunction }];
      });
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  const value = React.useMemo(
    () => ({
      addModal,
      closeModal,
      removeModal,
    }),
    [addModal, closeModal, removeModal],
  );

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
