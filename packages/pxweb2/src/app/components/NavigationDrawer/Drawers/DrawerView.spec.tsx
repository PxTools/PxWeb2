import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';

import { DrawerView } from './DrawerView';
import { renderWithProviders } from '../../../util/testing-utils';

const { defaultMockConfig, mockGetConfig } = vi.hoisted(() => {
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
    pivot: vi.fn(),
  }),
}));

interface MockActionItemProps {
  label?: string;
}

vi.mock('@pxweb2/pxweb2-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@pxweb2/pxweb2-ui')>();

  return {
    ...actual,
    ContentBox: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="content-box">{children}</div>
    ),
    ActionItem: ({ label }: MockActionItemProps) => (
      <button data-testid="action-item">{label}</button>
    ),
    LocalAlert: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="local-alert">{children}</div>
    ),
  };
});

beforeEach(() => {
  mockGetConfig.mockReset();
  mockGetConfig.mockReturnValue(defaultMockConfig);
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
});
