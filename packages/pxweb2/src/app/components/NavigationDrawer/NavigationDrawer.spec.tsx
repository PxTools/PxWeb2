import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, beforeEach, vi, expect } from 'vitest';
import '@testing-library/jest-dom';
import { NavigationDrawer } from './NavigationDrawer';

vi.mock('i18next', () => ({
  default: { dir: () => 'ltr' },
  dir: () => 'ltr'
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (s: any) => s })
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

  it('renders focus trap sentinels when not large screen', () => {
    render(<NavigationDrawer {...defaultProps} />);
    const sentinels = screen.getAllByRole('presentation', { hidden: true });
    expect(sentinels.length).toBeGreaterThanOrEqual(1);
  });
});
