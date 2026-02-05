import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from 'react';

type Modal = {
  name: string;
  closeFunction: () => void;
};

type FocusOverride = {
  self: HTMLElement;
  previous?: HTMLElement;
  next?: HTMLElement;
};

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

export const AccessibilityContext =
  createContext<AccessibilityContextType | null>(null);

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
 * Add ref for override and previous and next element based on what is relevant. When the browser
 * sets focus on the element that next / previous has an override for it will select the next or previous element based on the override.
 */
export const AccessibilityProvider = ({
  children,
}: AccessibilityProviderProps) => {
  const [modals, setModals] = useState<Modal[]>([]);
  const [focusOverrides, setFocusOverrides] = useState<FocusOverride[]>([]);
  const pendingCloseRef = useRef<(() => void) | null>(null);

  // Debug logging in development
  useEffect(() => {
    // NOSONAR: Keep optional debug logging for local troubleshooting during release stabilization
    // if (
    //   location.href.includes('localhost') &&
    //   process.env.NODE_ENV !== 'test'
    // ) {
    //   console.log('PxWeb2 - a11y - Modals (Stack):', modals);
    //   console.log('PxWeb2 - a11y - Focus overrides:', focusOverrides);
    // }
  }, [modals, focusOverrides]);

  //This function updates the modal state by removing the last modal from the stack.
  const closeModal = useCallback(() => {
    setModals((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      const last = prev.at(-1);
      if (last) {
        pendingCloseRef.current = last.closeFunction; // capture, don't call here
        return prev.slice(0, -1);
      }
      return prev;
    });

    // Call the consumer close function after the state update
    setTimeout(() => {
      pendingCloseRef.current?.();
      pendingCloseRef.current = null;
    }, 0);
  }, []);

  const removeFocusOverride = useCallback((name: string) => {
    setFocusOverrides((prev) =>
      prev.filter(
        (override) =>
          override.self.getAttribute('data-focus-override-id') !== name,
      ),
    );
  }, []);

  const removeModal = useCallback((name: string) => {
    setModals((prev) => prev.filter((modal) => modal.name !== name));
  }, []);

  const addModal = useCallback((name: string, closeFunction: () => void) => {
    setModals((prev) => {
      const filteredModals = prev.filter((modal) => modal.name !== name);
      return [...filteredModals, { name, closeFunction }];
    });
  }, []);

  const findFocusOverride = useCallback(
    (element: HTMLElement) => {
      return (
        focusOverrides.find(
          (override) =>
            override.self.getAttribute('data-focus-override-id') ===
            element.getAttribute('data-focus-override-id'),
        ) || null
      );
    },
    [focusOverrides],
  );

  const addFocusOverride = useCallback(
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

        return [
          ...filteredOverrides,
          {
            self: element,
            previous,
            next,
          },
        ];
      });
    },
    [],
  );

  const focusNext = useCallback(
    (element: HTMLElement, event: KeyboardEvent) => {
      const next = findFocusOverride(element)?.next;
      if (next) {
        event.preventDefault();
        next.focus();
      }
    },
    [findFocusOverride],
  );

  const focusPrevious = useCallback(
    (element: HTMLElement, event: KeyboardEvent) => {
      const previous = findFocusOverride(element)?.previous;
      if (previous) {
        event.preventDefault();
        previous.focus();
      }
    },
    [findFocusOverride],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }

      if (event.key === 'Tab') {
        const target = event.target as HTMLElement;

        if (!event.shiftKey) {
          // NOSONAR: Keep optional debug logging for local troubleshooting during release stabilization
          // if (location.href.includes('localhost')) {
          //   console.log('PxWeb2 - a11y - Tab pressed');
          // }
          focusNext(target, event);
        } else {
          // NOSONAR: Keep optional debug logging for local troubleshooting during release stabilization
          // if (location.href.includes('localhost')) {
          //   console.log('PxWeb2 - a11y - Shift + Tab pressed');
          // }
          focusPrevious(target, event);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeModal, focusNext, focusPrevious]);

  const value = useMemo(
    () => ({
      addModal,
      closeModal,
      removeModal,
      addFocusOverride,
      removeFocusOverride,
    }),
    [addModal, closeModal, removeModal, addFocusOverride, removeFocusOverride],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
