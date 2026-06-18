import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';

import { DrawerView } from './DrawerView';

const mockGetConfig = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../../util/config/getConfig', () => ({
  getConfig: () => mockGetConfig(),
}));

interface MockActionItemProps {
  label?: string;
}

vi.mock('@pxweb2/pxweb2-ui', () => ({
  ContentBox: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-box">{children}</div>
  ),
  ActionItem: ({ label }: MockActionItemProps) => (
    <button data-testid="action-item">{label}</button>
  ),
  LocalAlert: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="local-alert">{children}</div>
  ),
}));

beforeEach(() => {
  mockGetConfig.mockReturnValue({
    features: {
      chartEnabled: true,
    },
  });
});

describe('DrawerView', () => {
  it('renders successfully', () => {
    render(
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
      features: {
        chartEnabled: false,
      },
    });

    render(
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
