import { scrollToTop } from './Footer';
import { describe, it, expect, vi } from 'vitest';

describe('scrollToTop', () => {
  it('should scroll the container to the top quickly', () => {
    // Create a mock container
    const container = document.createElement('div');
    container.scrollTop = 1000;
    Object.defineProperty(container, 'scrollTop', {
      writable: true,
      value: 1000,
    });
    // Mock ref
    const ref = { current: container };

    // Use fake timers
    vi.useFakeTimers();
    scrollToTop(ref);
    // Fast-forward all timers
    vi.runAllTimers();

    expect(container.scrollTop).toBe(0);
    vi.useRealTimers();
  });
});
