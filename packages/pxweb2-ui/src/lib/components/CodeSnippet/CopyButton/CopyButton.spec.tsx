import '@testing-library/jest-dom/vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CopyButton } from './CopyButton';

vi.mock('../../Button/Button', () => ({
  default: ({
    'aria-label': ariaLabel,
    onClick,
    icon,
    className,
  }: {
    'aria-label': string;
    onClick: () => void;
    icon: string;
    className?: string;
  }) => (
    <button
      aria-label={ariaLabel}
      onClick={onClick}
      data-icon={icon}
      className={className}
    />
  ),
}));

describe('CopyButton', () => {
  const defaultProps = {
    title: 'JSON',
    copyContent: '{"key": "value"}',
    translations: {
      copyButtonLabel: 'Copy ',
      copiedButtonLabel: 'Copied!',
    },
  };

  beforeEach(() => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });
  });

  it('should render with copy label', () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Copy');
  });

  it('should copy content to clipboard on click', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '{"key": "value"}',
      );
    });
  });

  it('should show copied state after clicking', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Copied!');
      expect(button).toHaveAttribute('data-icon', 'Check');
    });
  });

  it('should revert to copy state after 3 seconds', async () => {
    vi.useFakeTimers();

    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toHaveAttribute('aria-label', 'Copied!');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Copy');

    vi.useRealTimers();
  });

  it('should reset timer when clicked multiple times', async () => {
    vi.useFakeTimers();

    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button');

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toHaveAttribute('aria-label', 'Copied!');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Still copied because timer was reset
    expect(button).toHaveAttribute('aria-label', 'Copied!');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now reverted after full 3 seconds from last click
    expect(button).toHaveAttribute('aria-label', 'Copy JSON');

    vi.useRealTimers();
  });

  describe('live region', () => {
    it('should have a live region with assertive aria-live', () => {
      render(<CopyButton {...defaultProps} />);

      const liveRegion = screen.getByText('Copy JSON');

      expect(liveRegion).toHaveAttribute('aria-live', 'assertive');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('should update live region text when copied, and revert live region text after 3 seconds', async () => {
      vi.useFakeTimers();

      render(<CopyButton {...defaultProps} />);

      const liveRegion = screen.getByText('Copy JSON');
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
        await Promise.resolve();
      });

      expect(liveRegion).toHaveTextContent('Copied!');

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(liveRegion).toHaveTextContent('Copy JSON');

      vi.useRealTimers();
    });
  });
});
