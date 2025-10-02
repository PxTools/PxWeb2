import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { renderWithProviders } from '../../util/testing-utils';
import WipStatusMessage from './WipStatusMessage';

let isBannerDismissed = false;
const setIsBannerDismissed = vi.fn(() => {
  isBannerDismissed = true;
});

vi.mock('../../context/useApp', () => ({
  default: () => ({
    isBannerDismissed,
    setIsBannerDismissed,
  }),
}));

// Mock Alert component
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Alert: ({
    children,
    onDismissed,
    closeButton,
    ...props
  }: {
    children: React.ReactNode;
    onDismissed: () => void;
    closeButton?: boolean;
  }) => (
    <div data-testid="banner-alert" {...props}>
      {children}
      {closeButton && (
        <button data-testid="close-btn" onClick={onDismissed}>
          Close
        </button>
      )}
    </div>
  ),
  BreakpointsXsmallMaxWidth: '575px',
  BreakpointsMediumMaxWidth: '767px',
  BreakpointsLargeMaxWidth: '991px',
  BreakpointsXlargeMaxWidth: '1199px',
}));

beforeEach(() => {
  sessionStorage.clear();
  isBannerDismissed = false;
  setIsBannerDismissed.mockClear();
});

describe('WipStatusMessage', () => {
  it('renders the alert when not dismissed', () => {
    renderWithProviders(<WipStatusMessage />);
    expect(screen.getByTestId('banner-alert')).toBeInTheDocument();
    expect(
      screen.getByText('common.status_messages.welcome'),
    ).toBeInTheDocument();
  });

  it('does not render the alert if dismissed', () => {
    isBannerDismissed = true;
    renderWithProviders(<WipStatusMessage />);
    expect(screen.queryByTestId('banner-alert')).not.toBeInTheDocument();
  });

  it('calls setIsBannerDismissed and sets sessionStorage when close button is clicked', () => {
    renderWithProviders(<WipStatusMessage />);
    const closeBtn = screen.getByTestId('close-btn');
    fireEvent.click(closeBtn);

    expect(setIsBannerDismissed).toHaveBeenCalledWith(true);
    expect(sessionStorage.getItem('pxweb2.wip_status_message_dismissed')).toBe(
      'true',
    );
  });
});
