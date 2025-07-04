import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { DrawerEdit } from './DrawerEdit';

interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  icon?: string;
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
  }),
}));

vi.mock('@pxweb2/pxweb2-ui', () => ({
  ContentBox: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-box">{children}</div>
  ),
  Button: ({ children, onClick, variant, icon }: MockButtonProps) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-icon={icon}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

describe('DrawerEdit', () => {
  it('renders successfully', () => {
    render(<DrawerEdit />);

    expect(screen.getByTestId('content-box')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toBeInTheDocument();
    expect(
      screen.getByText('presentation_page.sidemenu.edit.customize.pivot.title'),
    ).toBeInTheDocument();
  });

  it('has correct display name', () => {
    expect(DrawerEdit.displayName).toBe('DrawerEdit');
  });

  it('calls pivotCW on button click', () => {
    render(<DrawerEdit />);

    const button = screen.getByTestId('button');
    button.click();

    expect(mockPivotCW).toHaveBeenCalledTimes(1);
    expect(mockPivotCW).toHaveBeenCalledWith();
  });
});
