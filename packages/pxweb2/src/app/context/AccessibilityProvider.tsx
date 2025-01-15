import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface AccessibilityContextType {
  addModal: (name: string, closeFunction: () => void) => void;
  closeModal: () => void;
  removeModal: (name: string) => void;
  addFocusOverride: (
    name: string,
    element: HTMLElement,
    previous?: HTMLElement,
    next?: HTMLElement,
  ) => void;
  removeFocusOverride: (name: string) => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType>({
  addModal: () => {},
  closeModal: () => {},
  removeModal: () => {},
  removeFocusOverride: () => {},
  addFocusOverride: () => {},
});

interface AccessibilityProviderProps {
  children: ReactNode;
}
type FocusOverride = {
  self: HTMLElement;
  previous?: HTMLElement;
  next?: HTMLElement;
};

/**
 * AccessibilityProvider
 *
 * Modal:
 * Makes it easier to handle which modal should be closed when pressing escape. It works like a stack.
 *
 * Focus:
 * Add ref for override and previous and next element based on what is relevant. When the browser
 * sets focus on the element that next / previous has an override for it will select the next or previous element based on the override.
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

  const [focusOverrides, setFocusOverrides] = useState<FocusOverride[]>([]);

  React.useEffect(() => {
    if (location.href.indexOf('localhost') > -1) {
      console.log('PxWeb2 - a11y - Modals (Stack):', modals);
      console.log('PxWeb2 - a11y - Focus overrides:', focusOverrides);
    }
  }, [modals, focusOverrides]);

  const closeModal = React.useCallback(() => {
    setModals((prev) => {
      if (prev.length === 0) return prev;
      prev[prev.length - 1].closeFunction();
      return prev.slice(0, -1);
    });
  }, []);

  const removeFocusOverride = React.useCallback(
    (name: string) => {
      setFocusOverrides((prev) =>
        prev.filter(
          (override) =>
            override.self.getAttribute('data-focus-override-id') !== name,
        ),
      );
    },
    [focusOverrides, setFocusOverrides],
  );

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

  const findFocusOverride = React.useCallback(
    (element: HTMLElement) => {
      const override = focusOverrides.find(
        (override) =>
          override.self.getAttribute('data-focus-override-id') ===
          element.getAttribute('data-focus-override-id'),
      );
      if (override) {
        return override;
      }
      return null;
    },
    [focusOverrides],
  );

  const addFocusOverride = React.useCallback(
    (
      name: string,
      element: HTMLElement,
      previous?: HTMLElement,
      next?: HTMLElement,
    ) => {
      element.setAttribute('data-focus-override-id', name);
      setFocusOverrides((prev) => {
        const filteredOverrides = prev.filter(
          (override) =>
            override.self.getAttribute('data-focus-override-id') !== name,
        );

        const newState = [
          ...filteredOverrides,
          {
            self: element,
            previous,
            next,
          },
        ];
        return newState;
      });
    },
    [focusOverrides],
  );

  const focusNext = React.useCallback(
    (element: HTMLElement, event: KeyboardEvent) => {
      const next = findFocusOverride(element)?.next;
      if (next) {
        event.preventDefault();
        next.focus();
      }
    },
    [focusOverrides],
  );

  const focusPrevious = React.useCallback(
    (element: HTMLElement, event: KeyboardEvent) => {
      const previous = findFocusOverride(element)?.previous;
      if (previous) {
        event.preventDefault();
        previous.focus();
      }
    },
    [focusOverrides],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }

      if (event.key === 'Tab' && !event.shiftKey) {
        console.log('PxWeb2 - a11y - Tab pressed');
        if (event.target) {
          focusNext(event.target as HTMLElement, event);
        }
      }

      if (event.shiftKey && event.key === 'Tab') {
        console.log('PxWeb2 - a11y - Shift + Tab pressed');

        if (event.target) {
          focusPrevious(event.target as HTMLElement, event);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, focusNext, focusPrevious, findFocusOverride]);

  const value = React.useMemo(
    () => ({
      addModal,
      closeModal,
      removeModal,
      addFocusOverride,
      removeFocusOverride,
    }),
    [addModal, closeModal, removeModal],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
