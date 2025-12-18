import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import WipStatusMessage from './WipStatusMessage';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Alert component
vi.mock('@pxweb2/pxweb2-ui', () => ({
  GlobalAlert: ({
    children,
    onDismissed,
    closeButton,
    ...props
  }: {
    children: React.ReactNode;
    onDismissed: () => void;
    closeButton?: boolean;
  }) => (
    <div data-testid="alert" {...props}>
      {children}
      {closeButton && (
        <button data-testid="close-btn" onClick={onDismissed}>
          Close
        </button>
      )}
    </div>
  ),
}));

// Clear sessionStorage before each test
beforeEach(() => {
  sessionStorage.clear();
});

describe('WipStatusMessage', () => {
  it('renders the alert when not dismissed', () => {
    render(<WipStatusMessage />);
    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(
      screen.getByText('common.status_messages.welcome'),
    ).toBeInTheDocument();
  });

  it('does not render the alert if dismissed in sessionStorage', () => {
    sessionStorage.setItem('pxweb2.wip_status_message_dismissed', 'true');
    render(<WipStatusMessage />);
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });

  it('dismisses the alert and sets sessionStorage when close button is clicked', () => {
    render(<WipStatusMessage />);
    const closeBtn = screen.getByTestId('close-btn');
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('pxweb2.wip_status_message_dismissed')).toBe(
      'true',
    );
  });
});
