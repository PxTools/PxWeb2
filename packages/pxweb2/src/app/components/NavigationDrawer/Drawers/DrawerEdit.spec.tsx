import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { DrawerEdit } from './DrawerEdit';
import { PivotType } from '../../../context/PivotType';

interface MockActionItemProps {
  label?: string;
  onClick?: () => void;
  iconName?: string;
  ariaLabel?: string;
  isLoading?: boolean;
  [key: string]: unknown;
}

const mockPivot = vi.fn();

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../../context/useTableData', () => ({
  default: () => ({
    pivot: mockPivot,
    data: {
      // Minimal shape; DrawerEdit only passes these through
      stub: [{ name: 'variable1' }],
      heading: [{ name: 'variable2' }],
    },
    buildTableTitle: () => ({
      firstTitlePart: 'First Part',
      lastTitlePart: 'Last Part',
    }),
  }),
}));

vi.mock('@pxweb2/pxweb2-ui', () => ({
  ContentBox: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-box">{children}</div>
  ),
  ActionItem: ({
    label,
    onClick,
    iconName,
    ariaLabel,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading,
    ...props
  }: MockActionItemProps) => (
    <button
      data-testid="action-item"
      data-icon={iconName}
      aria-label={ariaLabel}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  ),
  Alert: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert">{children}</div>
  ),
}));

vi.mock('../../../context/useApp', () => ({
  default: () => ({ isMobile: false }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe('DrawerEdit', () => {
  it('renders successfully', () => {
    render(<DrawerEdit />);

    expect(screen.getByTestId('content-box')).toBeInTheDocument();
    // Two action buttons: auto pivot & clockwise pivot (unified PivotButton)
    const buttons = screen.getAllByTestId('action-item');
    expect(buttons).toHaveLength(2);
    // Check labels via translation keys
    expect(
      screen.getByText(
        'presentation_page.side_menu.edit.customize.auto_pivot.title',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'presentation_page.side_menu.edit.customize.pivot.title',
      ),
    ).toBeInTheDocument();
  });

  it('has correct display name', () => {
    expect(DrawerEdit.displayName).toBe('DrawerEdit');
  });

  it('calls pivot with PivotType.Clockwise on its button click', async () => {
    render(<DrawerEdit />);
    const user = userEvent.setup();
    const clockwiseButton = screen.getByText(
      'presentation_page.side_menu.edit.customize.pivot.title',
    );
    await user.click(clockwiseButton);
    await waitFor(
      () => {
        expect(mockPivot).toHaveBeenCalledWith(PivotType.Clockwise);
        expect(mockPivot).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );
  });

  it('calls pivot with PivotType.Auto on its button click', async () => {
    render(<DrawerEdit />);
    const user = userEvent.setup();
    const autoButton = screen.getByText(
      'presentation_page.side_menu.edit.customize.auto_pivot.title',
    );
    await user.click(autoButton);
    await waitFor(
      () => {
        expect(mockPivot).toHaveBeenCalledWith(PivotType.Auto);
        expect(mockPivot).toHaveBeenCalledTimes(1);
      },
      { timeout: 2000 },
    );
  });
});
