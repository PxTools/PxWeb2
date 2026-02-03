import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, afterEach } from 'vitest';
import NavigationDrawer from './NavigationDrawer';

// Mocks
vi.mock('../../context/useAccessibility', () => ({
  __esModule: true,
  default: () => ({
    addModal: vi.fn(),
    removeModal: vi.fn(),
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('@pxweb2/pxweb2-ui', () => ({
  Heading: (props: React.ComponentProps<'h2'>) => <h2 {...props} />,
  Icon: () => <span data-icon="true" />,
  Label: (props: React.ComponentProps<'span'>) => <span {...props} />,
  getIconDirection: (dir: string, ltr: string, rtl: string) => (dir === 'rtl' ? rtl : ltr),
}));

vi.mock('i18next', () => ({
  __esModule: true,
  default: { dir: () => 'ltr' },
}));

// useApp mock (hook default export)
import useApp from '../../context/useApp';
vi.mock('../../context/useApp', () => ({
  __esModule: true,
  default: vi.fn(),
}));

function setSmallScreen(isSmall: boolean) {
  (useApp as any).mockReturnValue({
    skipToMainFocused: false,
    isMobile: false,
    isTablet: false,
  });
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: isSmall && query === '(max-width: 1199px)',
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

afterEach(() => {
  // Cleanup custom drawer root if created
  const root = document.querySelector('[data-drawer-root]');
  root?.parentElement?.removeChild(root);
  vi.clearAllMocks();
});

function renderDrawer(options?: {
  view?: 'selection' | 'view' | 'edit' | 'save' | 'help';
  heading?: string;
  openedWithKeyboard?: boolean;
  smallScreen?: boolean;
  useDrawerRoot?: boolean;
  onClose?: ReturnType<typeof vi.fn>;
}) {
  const {
    view = 'selection',
    heading = 'Selection',
    openedWithKeyboard = false,
    smallScreen = false,
    useDrawerRoot = false,
    onClose = vi.fn(),
  } = options || {};

  setSmallScreen(smallScreen);

  if (useDrawerRoot) {
    const root = document.createElement('div');
    root.setAttribute('data-drawer-root', '');
    document.body.appendChild(root);
  }

  // Forwarded ref to the hide button
  const ref = React.createRef<HTMLButtonElement>();

  render(
    <NavigationDrawer
      ref={ref}
      view={view}
      heading={heading}
      openedWithKeyboard={openedWithKeyboard}
      onClose={onClose}
    >
      <div>
        <button type="button">A</button>
        <button type="button">B</button>
      </div>
    </NavigationDrawer>
  );

  return { ref, onClose };
}

test('portals into [data-drawer-root] when present', () => {
  renderDrawer({ smallScreen: false, useDrawerRoot: true });

  const portalRoot = document.querySelector('[data-drawer-root]') as HTMLElement;
  expect(portalRoot).toBeInTheDocument();

  const drawer = within(portalRoot).getByTestId('selection-drawer');
  expect(drawer).toBeInTheDocument();

  // On large screens, drawer is a region (not dialog)
  expect(drawer).toHaveAttribute('role', 'region');
  expect(drawer).not.toHaveAttribute('aria-modal');
});

test('falls back to document.body when no [data-drawer-root] is present', () => {
  renderDrawer({ smallScreen: false, useDrawerRoot: false });

  const drawer = document.querySelector('[data-view="selection"]') as HTMLElement;
  expect(drawer).toBeInTheDocument();
  expect(drawer.parentElement).toBe(document.body);
});

test('small screens: role="dialog" and aria-modal="true"', () => {
  renderDrawer({ smallScreen: true });

  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeInTheDocument();
  // Current implementation uses string "true"
  expect(dialog).toHaveAttribute('aria-modal', 'true');
});

test('small screens: clicking backdrop calls onClose(false, view)', () => {
  const { onClose } = renderDrawer({ smallScreen: true });

  const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
  expect(backdrop).toBeInTheDocument();

  fireEvent.click(backdrop);
  expect(onClose).toHaveBeenCalledWith(false, 'selection');
});

test('forwarded ref focuses hide button when openedWithKeyboard=true', async () => {
  const { ref } = renderDrawer({ smallScreen: false, openedWithKeyboard: true });

  const hideBtn = screen.getByRole('button', {
    name: 'presentation_page.side_menu.hide',
  });

  expect(ref.current).toBe(hideBtn);
  await waitFor(() => expect(hideBtn).toHaveFocus());
});

test('small screens: focus trap cycles Tab within the drawer', async () => {
  renderDrawer({ smallScreen: true });

    const hideBtn = screen.getByRole('button', {
    name: 'presentation_page.side_menu.hide',
  });
  const btnA = screen.getByRole('button', { name: 'A' });
  const btnB = screen.getByRole('button', { name: 'B' });

  // jsdom lacks layout; mark elements as visible for offsetParent filter
  [hideBtn, btnA, btnB].forEach((el) => {
    Object.defineProperty(el, 'offsetParent', {
      value: document.body,
      configurable: true,
    });
    Object.defineProperty(el, 'offsetWidth', { value: 10, configurable: true });
    Object.defineProperty(el, 'offsetHeight', { value: 10, configurable: true });
  });

  // Move focus to the last focusable element (B)
  btnB.focus();
  expect(btnB).toHaveFocus();

  // Tab from last should wrap to first (hide button)
  await userEvent.tab();
  await waitFor(() => expect(hideBtn).toHaveFocus());
});

test('small screens: document-level trap pulls focus back into drawer on Tab', async () => {
  renderDrawer({ smallScreen: true });

  const hideBtn = screen.getByRole('button', {
    name: 'presentation_page.side_menu.hide',
  });

  // Simulate focus escaping to an external, focusable element outside the drawer
  const outsideButton = document.createElement('button');
  outsideButton.textContent = 'outside';
  document.body.appendChild(outsideButton);
  outsideButton.focus();
  expect(document.activeElement).toBe(outsideButton);

  // Global tab should move focus back to the drawer's first focusable
  await userEvent.tab();
  await waitFor(() => expect(hideBtn).toHaveFocus());
});

test('small screens: Escape closes the drawer with keyboard=true', () => {
  const { onClose } = renderDrawer({ smallScreen: true });

  const drawer = screen.getByTestId('selection-drawer');
  fireEvent.keyDown(drawer, { key: 'Escape' });

  expect(onClose).toHaveBeenCalledWith(true, 'selection');
});
