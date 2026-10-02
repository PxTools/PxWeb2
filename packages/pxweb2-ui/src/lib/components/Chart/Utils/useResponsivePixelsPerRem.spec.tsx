import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useResponsivePixelsPerRem } from './useResponsivePixelsPerRem';

function HookHost() {
  const pixelsPerRem = useResponsivePixelsPerRem();

  return <div data-testid="pixels-per-rem">{pixelsPerRem}</div>;
}

describe('useResponsivePixelsPerRem', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('reads the root font size on mount', () => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontSize: '20px',
    } as CSSStyleDeclaration);

    render(<HookHost />);

    expect(screen.getByTestId('pixels-per-rem').textContent).toBe('20');
  });

  it.each(['auto', '0px', '-2px'])('uses 16px when the root font size is %s', (fontSize) => {
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      fontSize,
    } as CSSStyleDeclaration);

    render(<HookHost />);

    expect(screen.getByTestId('pixels-per-rem').textContent).toBe('16');
  });

  it('updates the value when the window is resized', () => {
    let fontSize = '16px';
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ fontSize }) as CSSStyleDeclaration,
    );

    render(<HookHost />);
    expect(screen.getByTestId('pixels-per-rem').textContent).toBe('16');

    fontSize = '24px';
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId('pixels-per-rem').textContent).toBe('24');
  });

  it('updates with ResizeObserver and cleans up on unmount', () => {
    let fontSize = '16px';
    let observerCallback: ResizeObserverCallback | undefined;
    const observe = vi.fn();
    const disconnect = vi.fn();

    class ResizeObserverMock {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback;
      }

      observe = observe;
      disconnect = disconnect;
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ fontSize }) as CSSStyleDeclaration,
    );

    const { unmount } = render(<HookHost />);

    expect(observe).toHaveBeenCalledWith(document.documentElement);

    fontSize = '18px';
    act(() => {
      observerCallback?.([], {} as ResizeObserver);
    });

    expect(screen.getByTestId('pixels-per-rem').textContent).toBe('18');

    const getComputedStyle = vi.mocked(window.getComputedStyle);
    getComputedStyle.mockClear();
    unmount();

    expect(disconnect).toHaveBeenCalledOnce();
    window.dispatchEvent(new Event('resize'));
    expect(getComputedStyle).not.toHaveBeenCalled();
  });
});