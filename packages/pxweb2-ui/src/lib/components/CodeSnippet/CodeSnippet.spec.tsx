import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { CodeSnippet } from './CodeSnippet';

vi.mock('./CodeSnippetHeader/CodeSnippetHeader', () => ({
  CodeSnippetHeader: ({
    title,
    copyContent,
    translations,
  }: {
    title: string;
    copyContent: string;
    translations: { copyButtonLabel: string; copiedButtonLabel: string };
  }) => (
    <div data-testid="code-snippet-header">
      <span data-testid="header-title">{title}</span>
      <span data-testid="header-copy-content">{copyContent}</span>
      <span data-testid="header-copy-label">
        {translations.copyButtonLabel}
      </span>
      <span data-testid="header-copied-label">
        {translations.copiedButtonLabel}
      </span>
    </div>
  ),
}));

vi.mock('./CodeSnippetBody/CodeSnippetBody', () => ({
  CodeSnippetBody: ({
    children,
    highlight,
  }: {
    children: string;
    highlight: string;
  }) => (
    <div data-testid="code-snippet-body">
      <span data-testid="body-content">{children}</span>
      <span data-testid="body-highlight">{highlight}</span>
    </div>
  ),
}));

describe('CodeSnippet', () => {
  const defaultTranslations = {
    copyButtonLabel: 'Copy code',
    copiedButtonLabel: 'Code copied',
  };

  it('should render correctly', () => {
    const { container } = render(
      <CodeSnippet
        title="Example JSON Snippet"
        translations={defaultTranslations}
      >
        {'Content of the code snippet'}
      </CodeSnippet>,
    );

    expect(container).toBeTruthy();
  });

  it('should render CodeSnippetHeader with correct props', () => {
    const title = 'API Response';
    const content = '{"key": "value"}';

    render(
      <CodeSnippet title={title} translations={defaultTranslations}>
        {content}
      </CodeSnippet>,
    );

    expect(screen.getByTestId('code-snippet-header')).toBeInTheDocument();
    expect(screen.getByTestId('header-title')).toHaveTextContent(title);
    expect(screen.getByTestId('header-copy-content')).toHaveTextContent(
      content,
    );
    expect(screen.getByTestId('header-copy-label')).toHaveTextContent(
      defaultTranslations.copyButtonLabel,
    );
    expect(screen.getByTestId('header-copied-label')).toHaveTextContent(
      defaultTranslations.copiedButtonLabel,
    );
  });

  it('should render CodeSnippetBody with correct props', () => {
    const content = '{"name": "test"}';

    render(
      <CodeSnippet
        title="Test Snippet"
        highlight="json"
        translations={defaultTranslations}
      >
        {content}
      </CodeSnippet>,
    );

    expect(screen.getByTestId('code-snippet-body')).toBeInTheDocument();
    expect(screen.getByTestId('body-content')).toHaveTextContent(content);
    expect(screen.getByTestId('body-highlight')).toHaveTextContent('json');
  });

  it('should use "text" as default highlight option', () => {
    render(
      <CodeSnippet title="Plain Text" translations={defaultTranslations}>
        {'Some plain text content'}
      </CodeSnippet>,
    );

    expect(screen.getByTestId('body-highlight')).toHaveTextContent('text');
  });

  it('should pass children to both header (as copyContent) and body', () => {
    const codeContent = 'const x = 42;';

    render(
      <CodeSnippet title="JS Code" translations={defaultTranslations}>
        {codeContent}
      </CodeSnippet>,
    );

    expect(screen.getByTestId('header-copy-content')).toHaveTextContent(
      codeContent,
    );
    expect(screen.getByTestId('body-content')).toHaveTextContent(codeContent);
  });
});
