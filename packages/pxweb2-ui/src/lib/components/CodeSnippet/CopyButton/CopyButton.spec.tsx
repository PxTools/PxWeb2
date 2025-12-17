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
    title,
    onClick,
    icon,
    className,
  }: {
    'aria-label': string;
    title: string;
    onClick: () => void;
    icon: string;
    className?: string;
  }) => (
    <button
      aria-label={ariaLabel}
      title={title}
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
      copyButtonTooltip: 'Copy to clipboard',
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

    const button = screen.getByRole('button', { name: 'Copy JSON' });

    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Copy');
    expect(button).toHaveAttribute('title', 'Copy to clipboard');
  });

  it('should copy content to clipboard on click', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Copy JSON' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '{"key": "value"}',
      );
    });
  });

  it('should show copied state after clicking (stable aria-label)', async () => {
    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Copy JSON' });
    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Copy');
    expect(button.className).toBe('');

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toHaveAttribute('aria-label', 'Copy JSON');
      expect(button).toHaveAttribute('data-icon', 'Check');
      expect(button.className).not.toBe('');
    });
  });

  it('should revert to copy state after 3 seconds', async () => {
    vi.useFakeTimers();

    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Copy JSON' });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Check');
    expect(button.className).not.toBe('');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Copy');
    expect(button.className).toBe('');

    vi.useRealTimers();
  });

  it('should reset timer when clicked multiple times', async () => {
    vi.useFakeTimers();

    render(<CopyButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Copy JSON' });

    await act(async () => {
      fireEvent.click(button);
      await Promise.resolve();
    });

    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Check');

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
    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Check');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Now reverted after full 3 seconds from last click
    expect(button).toHaveAttribute('aria-label', 'Copy JSON');
    expect(button).toHaveAttribute('data-icon', 'Copy');

    vi.useRealTimers();
  });

  describe('live region', () => {
    it('should have a live region with assertive aria-live', () => {
      const { container } = render(<CopyButton {...defaultProps} />);
      const liveRegion = container.querySelector('[aria-live="assertive"]');

      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
      expect(liveRegion).toHaveTextContent('');
    });

    it('should update live region text when copied, and revert live region text after 3 seconds', async () => {
      vi.useFakeTimers();

      const { container } = render(<CopyButton {...defaultProps} />);
      const liveRegion = container.querySelector('[aria-live="assertive"]');
      const button = screen.getByRole('button', { name: 'Copy JSON' });

      expect(liveRegion).toHaveTextContent('');

      await act(async () => {
        fireEvent.click(button);
        await Promise.resolve();
      });

      expect(liveRegion).toHaveTextContent('Copied!');

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(liveRegion).toHaveTextContent('');

      vi.useRealTimers();
    });
  });
});
