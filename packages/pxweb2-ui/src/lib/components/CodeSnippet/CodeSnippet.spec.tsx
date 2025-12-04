import { render } from '@testing-library/react';
import { vi } from 'vitest';

import { CodeSnippet } from './CodeSnippet';

// Mock ResizeObserver which is not available in jsdom
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock;

const jsonCode = `{
  "name": "pxweb2-ui",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^4.0.0"
  }
}`;

describe('CodeSnippet', () => {
  it('should render correctly', () => {
    const { container } = render(
      <CodeSnippet
        title="Example JSON Snippet"
        translations={{
          copyButtonLabel: 'Copy code',
          copiedButtonLabel: 'Code copied',
        }}
      >
        {jsonCode}
      </CodeSnippet>,
    );

    expect(container).toBeTruthy();
  });
});
