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
  addFocusableElement: (name: string, ref: HTMLElement) => void;
  removeFocusableElement: (name: string) => void;
  removeAllFocusableElements: () => void;
  addFocusableElements: (elements: FocusableElement[]) => void;
  removeFocusableElements: (elements: FocusableElement[]) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(
  null,
);

interface AccessibilityProviderProps {
  children: ReactNode;
}

/**
 * AccessibilityProvider
 *
 * Modal:
 * Makes it easier to handle which modal should be closed when pressing escape. It works like a stack.
 *
 * Focus:
 * Makes it easier to handle focus order for focusable elements. It works like a queue.
 * If there are focusable elements it will override the default focus order and
 * use the current order until the first element after the end of the order or
 * the first element before the start of the order.
 */

export const AccessibilityProvider = ({
  children,
}: AccessibilityProviderProps) => {
  const [modals, setModals] = useState<
    {
      name: string;
      closeFunction: () => void;
    }[]
  >([]);

  const [focusableElements, setFocusableElements] = useState<
    {
      name: string;
      ref: HTMLElement;
    }[]
  >([]);

  const [currentFocus, setCurrentFocus] = useState<string | null>(null);

  React.useEffect(() => {
    if (location.href.indexOf('localhost') > -1) {
      console.log('PxWeb2 - a11y - Modals (Stack):', modals);
      console.log(
        'PxWeb2 - a11y - Focusable elements (Queue):',
        focusableElements,
      );
    }
  }, [modals, focusableElements]);

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

  const getCurrentFocusIndex = React.useCallback(() => {
    return focusableElements.findIndex(
      (element) => element.name === currentFocus,
    );
  }, [focusableElements, currentFocus]);

  const focusNextElement = React.useCallback(() => {
    const nextElement = focusableElements[getCurrentFocusIndex() + 1];
    if (nextElement) {
      nextElement.ref.focus();
    }
  }, [focusableElements]);

  const focusPreviousElement = React.useCallback(() => {
    const previousElement = focusableElements[getCurrentFocusIndex() - 1];
    if (previousElement) {
      setCurrentFocus(previousElement.name);
      previousElement.ref.focus();
    }
  }, [focusableElements]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
      if (event.key === 'Tab') {
        focusNextElement();
      }
      if (event.shiftKey && event.key === 'Tab') {
        focusPreviousElement();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal]);

  const addFocusableElement = React.useCallback(
    (name: string, ref: HTMLElement) => {
      setFocusableElements((prev) => [...prev, { name, ref }]);
    },
    [],
  );

  const removeFocusableElement = React.useCallback((name: string) => {
    setFocusableElements((prev) =>
      prev.filter((element) => element.name !== name),
    );
  }, []);

  const removeAllFocusableElements = React.useCallback(() => {
    setFocusableElements([]);
  }, []);

  const addFocusableElements = React.useCallback(
    (elements: { name: string; ref: HTMLElement }[]) => {
      setFocusableElements((prev) => [...prev, ...elements]);
    },
    [],
  );

  const removeFocusableElements = React.useCallback(
    (elements: { name: string; ref: HTMLElement }[]) => {
      setFocusableElements((prev) =>
        prev.filter((element) => !elements.includes(element)),
      );
    },
    [],
  );

  const value = React.useMemo(
    () => ({
      addModal,
      closeModal,
      removeModal,
      addFocusableElement,
      removeFocusableElement,
      removeAllFocusableElements,
      addFocusableElements,
      removeFocusableElements,
    }),
    [
      addModal,
      closeModal,
      removeModal,
      addFocusableElement,
      removeFocusableElement,
      removeAllFocusableElements,
      addFocusableElements,
      removeFocusableElements,
    ],
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
