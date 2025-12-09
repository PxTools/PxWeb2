import '@testing-library/jest-dom/vitest';
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CodeSnippetBody } from './CodeSnippetBody';

vi.mock('../highlighter', () => ({
  getHighlighter: () =>
    Promise.resolve({
      codeToHast: (code: string) => ({
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'pre',
            properties: { className: 'shiki' },
            children: [
              {
                type: 'element',
                tagName: 'code',
                properties: {},
                children: [
                  {
                    type: 'text',
                    value: code,
                  },
                ],
              },
            ],
          },
        ],
      }),
    }),
}));

// Mock ResizeObserver
let resizeCallback: () => void;
class ResizeObserverMock {
  constructor(callback: () => void) {
    resizeCallback = callback;
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

const jsonCode = `{"name": "test", "version": "1.0.0"}`;

describe('CodeSnippetBody', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render code content', async () => {
    render(<CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>);

    // Code is shown immediately as fallback while highlighter loads
    expect(screen.getByText(jsonCode)).toBeInTheDocument();

    // Wait for async highlighter to complete
    await act(async () => {
      await Promise.resolve();
    });

    // Code is still visible after highlighting
    expect(screen.getByText(jsonCode)).toBeInTheDocument();
  });

  it('should render pre and code elements', async () => {
    const { container } = render(
      <CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>,
    );

    await waitFor(() => {
      expect(container.querySelector('pre')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
    });
  });

  it('should apply gradient class when content overflows', async () => {
    const { container } = render(
      <CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>,
    );

    // Wait for async highlighter to load
    await act(async () => {
      await Promise.resolve();
    });

    const preElement = container.querySelector('pre');
    if (preElement) {
      // Simulate overflow
      Object.defineProperty(preElement, 'scrollHeight', { value: 200 });
      Object.defineProperty(preElement, 'clientHeight', { value: 100 });
      act(() => {
        resizeCallback();
      });
    }

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toMatch(/linear-gradient-bottom/);
  });

  it('should not have gradient class when no overflow', async () => {
    const { container } = render(
      <CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>,
    );

    // Wait for async highlighter to load
    await act(async () => {
      await Promise.resolve();
    });

    const preElement = container.querySelector('pre');
    if (preElement) {
      Object.defineProperty(preElement, 'scrollHeight', { value: 100 });
      Object.defineProperty(preElement, 'clientHeight', { value: 100 });
      act(() => {
        resizeCallback();
      });
    }

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toMatch(/linear-gradient-bottom/);
  });

  it('should remove gradient when scrolled to bottom', async () => {
    const { container } = render(
      <CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>,
    );

    // Wait for async highlighter to load
    await act(async () => {
      await Promise.resolve();
    });

    const preElement = container.querySelector('pre');
    if (preElement) {
      // Setup overflow
      Object.defineProperty(preElement, 'scrollHeight', { value: 200 });
      Object.defineProperty(preElement, 'clientHeight', { value: 100 });
      act(() => {
        resizeCallback();
      });

      // Scroll to bottom
      Object.defineProperty(preElement, 'scrollTop', { value: 100 });
      fireEvent.scroll(preElement);
    }

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toMatch(/linear-gradient-bottom/);
  });

  it('should set tabindex on pre element when content overflows', async () => {
    const { container } = render(
      <CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>,
    );

    // Wait for async highlighter to load
    await act(async () => {
      await Promise.resolve();
    });

    const preElement = container.querySelector('pre');
    if (preElement) {
      Object.defineProperty(preElement, 'scrollHeight', { value: 200 });
      Object.defineProperty(preElement, 'clientHeight', { value: 100 });
      await act(async () => {
        resizeCallback();
      });
    }

    expect(preElement).toHaveAttribute('tabindex', '0');
  });

  it('should not have tabindex when no overflow', async () => {
    const { container } = render(
      <CodeSnippetBody highlight="json">{jsonCode}</CodeSnippetBody>,
    );

    // Wait for async highlighter to load
    await act(async () => {
      await Promise.resolve();
    });

    const preElement = container.querySelector('pre');
    if (preElement) {
      Object.defineProperty(preElement, 'scrollHeight', { value: 100 });
      Object.defineProperty(preElement, 'clientHeight', { value: 100 });
      await act(async () => {
        resizeCallback();
      });
    }

    expect(preElement).not.toHaveAttribute('tabindex');
  });

  it('should work with text highlight option', async () => {
    render(<CodeSnippetBody highlight="text">{'plain text'}</CodeSnippetBody>);

    // Code is shown immediately as fallback while highlighter loads
    expect(screen.getByText('plain text')).toBeInTheDocument();

    // Wait for async highlighter to complete
    await act(async () => {
      await Promise.resolve();
    });

    // Code is still visible after highlighting
    expect(screen.getByText('plain text')).toBeInTheDocument();
  });
});
