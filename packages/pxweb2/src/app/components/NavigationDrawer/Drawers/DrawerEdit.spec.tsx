import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { DrawerEdit } from './DrawerEdit';

interface MockActionItemProps {
  label?: string;
  onClick?: () => void;
  iconName?: string;
  ariaLabel?: string;
  [key: string]: unknown;
}

const mockPivotCW = vi.fn();

// Mock dependencies
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('../../../context/useTableData', () => ({
  default: () => ({
    pivotCW: mockPivotCW,
    data: {
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

describe('DrawerEdit', () => {
  it('renders successfully', () => {
    render(<DrawerEdit />);

    expect(screen.getByTestId('content-box')).toBeInTheDocument();
    expect(screen.getByTestId('action-item')).toBeInTheDocument();
    expect(
      screen.getByText(
        'presentation_page.side_menu.edit.customize.pivot.title',
      ),
    ).toBeInTheDocument();
  });

  it('has correct display name', () => {
    expect(DrawerEdit.displayName).toBe('DrawerEdit');
  });

  it('calls pivotCW on button click', async () => {
    render(<DrawerEdit />);

    const button = screen.getByTestId('action-item');
    const user = userEvent.setup();
    await user.click(button);

    expect(mockPivotCW).toHaveBeenCalledTimes(1);
    expect(mockPivotCW).toHaveBeenCalledWith();
  });
});
