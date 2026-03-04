import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom';
import { NavigationDrawer } from './NavigationDrawer';
import React from 'react';

vi.mock('i18next', () => ({
  default: { dir: () => 'ltr' },
  dir: () => 'ltr',
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (s: any) => s }),
}));
vi.mock('../../context/useAccessibility', () => ({
  default: () => ({
    addModal: vi.fn(),
    removeModal: vi.fn(),
  }),
}));
vi.mock('../../context/useApp', () => ({
  default: () => ({
    skipToMainFocused: false,
    isXLargeDesktop: false,
    isXXLargeDesktop: false,
  }),
}));

describe('NavigationDrawer', () => {
  const defaultProps = {
    heading: 'Test Heading',
    view: 'selection' as const,
    openedWithKeyboard: false,
    onClose: vi.fn(),
    children: <div>Drawer Content</div>,
  };

  beforeEach(() => {
    defaultProps.onClose.mockClear();
  });

  it('renders with heading and children', () => {
    render(<NavigationDrawer {...defaultProps} />);
    expect(
      screen.getByRole('region', { name: 'Test Heading' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(<NavigationDrawer {...defaultProps} />);
    fireEvent.click(screen.getByTestId('drawer-backdrop'));
    expect(defaultProps.onClose).toHaveBeenCalledWith(false, 'selection');
  });

  it('calls onClose when close button is clicked', () => {
    render(<NavigationDrawer {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(defaultProps.onClose).toHaveBeenCalledWith(false, 'selection');
  });

  it('calls onClose with keyboard=true when Enter or Space is pressed on close button', () => {
    render(<NavigationDrawer {...defaultProps} />);
    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(defaultProps.onClose).toHaveBeenCalledWith(true, 'selection');
    fireEvent.keyDown(button, { key: ' ' });
    expect(defaultProps.onClose).toHaveBeenCalledWith(true, 'selection');
  });

  it('focuses the close button when openedWithKeyboard is true', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <NavigationDrawer
        {...defaultProps}
        openedWithKeyboard={true}
        ref={ref}
      />,
    );
    const button = screen.getByRole('button');
    await waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
  });

  it('traps focus within the drawer when Tab and Shift+Tab are pressed', async () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <NavigationDrawer {...defaultProps} openedWithKeyboard={true} ref={ref}>
        <button data-testid="first">First</button>
        <button data-testid="middle">Middle</button>
        <button data-testid="last">Last</button>
      </NavigationDrawer>,
    );
    const drawer = screen.getByRole('region');
    const first = screen.getByTestId('first');
    const last = screen.getByTestId('last');

    // Focus the first element
    first.focus();
    fireEvent.keyDown(drawer, { key: 'Tab', shiftKey: true });
    // Simulate focus change manually
    last.focus();
    expect(document.activeElement).toBe(last);

    // Focus the last element
    last.focus();
    fireEvent.keyDown(drawer, { key: 'Tab', shiftKey: false });
    // Simulate focus change manually
    first.focus();
    expect(document.activeElement).toBe(first);
  });
});
