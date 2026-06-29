import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';
import userEvent from '@testing-library/user-event';

import { DrawerView } from './DrawerView';
import { renderWithProviders } from '../../../util/testing-utils';

const {
  defaultMockConfig,
  mockGetConfig,
  mockPivotToMobile,
  mockPivotToDesktop,
  mockPivotToChart,
  mockIsMobile,
} = vi.hoisted(() => {
  const defaultMockConfig = {
    baseApplicationPath: '/',
    features: {
      chartEnabled: true,
    },
    language: {
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      supportedLanguages: [{ shorthand: 'en' }],
      positionInPath: 'after',
    },
  };

  return {
    defaultMockConfig,
    mockGetConfig: vi.fn(() => defaultMockConfig),
    mockPivotToMobile: vi.fn(),
    mockPivotToDesktop: vi.fn(),
    mockPivotToChart: vi.fn(),
    mockIsMobile: vi.fn(() => false),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: '3rdParty',
    init: () => undefined,
  },
}));

vi.mock('../../../util/config/getConfig', () => ({
  getConfig: mockGetConfig,
}));

vi.mock('../../../context/useTableData', () => ({
  default: () => ({
    pivotToMobile: mockPivotToMobile,
    pivotToDesktop: mockPivotToDesktop,
    pivotToChart: mockPivotToChart,
  }),
}));

vi.mock('../../../context/useApp', () => ({
  default: () => ({
    isMobile: mockIsMobile(),
  }),
}));

interface MockActionItemProps {
  label?: string;
  ariaLabel?: string;
  onClick?: () => void;
  toggleState?: boolean;
}

vi.mock('@pxweb2/pxweb2-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pxweb2/pxweb2-ui')>();

  return {
    ...actual,
    ContentBox: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="content-box">{children}</div>
    ),
    ActionItem: ({
      label,
      ariaLabel,
      onClick,
      toggleState,
    }: MockActionItemProps) => (
      <button
        data-testid="action-item"
        aria-label={ariaLabel}
        data-toggle-state={toggleState ? 'on' : 'off'}
        onClick={onClick}
      >
        {label}
      </button>
    ),
    LocalAlert: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="local-alert">{children}</div>
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockGetConfig.mockReset();
  mockGetConfig.mockReturnValue(defaultMockConfig);
  mockIsMobile.mockReturnValue(false);
});

describe('DrawerView', () => {
  it('renders successfully', () => {
    renderWithProviders(
      <MemoryRouter>
        <DrawerView />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('content-box')).toBeInTheDocument();
    expect(screen.getAllByTestId('action-item')).toHaveLength(2);
    expect(screen.queryByTestId('local-alert')).not.toBeInTheDocument();
  });

  it('renders info alert when chart view is disabled', () => {
    mockGetConfig.mockReturnValue({
      ...defaultMockConfig,
      features: {
        chartEnabled: false,
      },
    });

    renderWithProviders(
      <MemoryRouter>
        <DrawerView />
      </MemoryRouter>,
    );

    expect(screen.queryAllByTestId('action-item')).toHaveLength(0);
    expect(screen.getByTestId('local-alert')).toHaveTextContent(
      'common.status_messages.drawer_view',
    );
  });

  it('has correct display name', () => {
    expect(DrawerView.displayName).toBe('DrawerView');
  });

  it('clicking table action pivots to desktop table when not mobile', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/?view=linechart']}>
        <DrawerView />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {
        name: 'presentation_page.side_menu.view.table.title',
      }),
    );

    expect(mockPivotToDesktop).toHaveBeenCalledTimes(1);
    expect(mockPivotToMobile).not.toHaveBeenCalled();
  });

  it('clicking table action pivots to mobile table when mobile', async () => {
    mockIsMobile.mockReturnValue(true);

    renderWithProviders(
      <MemoryRouter initialEntries={['/?view=linechart']}>
        <DrawerView />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {
        name: 'presentation_page.side_menu.view.table.title',
      }),
    );

    expect(mockPivotToMobile).toHaveBeenCalledTimes(1);
    expect(mockPivotToDesktop).not.toHaveBeenCalled();
  });

  it('clicking linechart action pivots to chart', async () => {
    renderWithProviders(
      <MemoryRouter>
        <DrawerView />
      </MemoryRouter>,
    );

    const user = userEvent.setup();
    await user.click(
      screen.getByRole('button', {
        name: 'presentation_page.side_menu.view.linechart.title',
      }),
    );

    expect(mockPivotToChart).toHaveBeenCalledTimes(1);
    expect(mockPivotToDesktop).not.toHaveBeenCalled();
    expect(mockPivotToMobile).not.toHaveBeenCalled();
  });

  it('sets correct toggleState from search param view=linechart', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/?view=linechart']}>
        <DrawerView />
      </MemoryRouter>,
    );

    const tableButton = screen.getByRole('button', {
      name: 'presentation_page.side_menu.view.table.title',
    });
    const chartButton = screen.getByRole('button', {
      name: 'presentation_page.side_menu.view.linechart.title',
    });

    expect(tableButton).toHaveAttribute('data-toggle-state', 'off');
    expect(chartButton).toHaveAttribute('data-toggle-state', 'on');
  });
});
