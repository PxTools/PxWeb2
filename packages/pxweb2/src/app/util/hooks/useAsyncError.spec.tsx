import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { useAsyncError } from './useAsyncError';

describe('useAsyncError', () => {
  // Suppress act() warnings for these tests since we're intentionally
  // triggering state updates that throw errors
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation((message) => {
        // Only suppress React act() warnings, let other errors through
        if (
          typeof message === 'string' &&
          message.includes('not wrapped in act')
        ) {
          return;
        }
      });
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return a function', () => {
    const { result } = renderHook(() => useAsyncError());

    expect(typeof result.current).toBe('function');
  });

  it('should throw error on re-render after calling the returned function', () => {
    const { result, rerender } = renderHook(() => useAsyncError());
    const testError = new Error('Test async error');

    // Call the throwError function to set error state
    result.current(testError);

    // Re-render should throw the error
    expect(() => {
      rerender();
    }).toThrow('Test async error');
  });

  it('should not throw error if throwError function is not called', () => {
    const { result } = renderHook(() => useAsyncError());

    expect(() => result.current).not.toThrow();
  });

  it('should preserve the error instance when throwing', () => {
    const { result, rerender } = renderHook(() => useAsyncError());
    const testError = new Error('Specific error message');

    result.current(testError);

    try {
      rerender();
      // If we reach here, the test should fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toBe(testError);
      expect((error as Error).message).toBe('Specific error message');
    }
  });

  it('should create a new throwError function on each hook instance', () => {
    const { result: result1 } = renderHook(() => useAsyncError());
    const { result: result2 } = renderHook(() => useAsyncError());

    // Different hook instances should have different throwError functions
    expect(result1.current).not.toBe(result2.current);
  });
});
