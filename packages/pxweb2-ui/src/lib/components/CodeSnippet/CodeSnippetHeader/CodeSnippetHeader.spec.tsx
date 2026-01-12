import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CodeSnippetHeader } from './CodeSnippetHeader';

vi.mock('../CopyButton/CopyButton', () => ({
  CopyButton: ({
    title,
    copyContent,
    translations,
  }: {
    title: string;
    copyContent: string;
    translations: { copyButtonLabel: string; copiedButtonLabel: string };
  }) => (
    <button
      data-testid="copy-button"
      data-title={title}
      data-copy-content={copyContent}
      data-copy-label={translations.copyButtonLabel}
      data-copied-label={translations.copiedButtonLabel}
    >
      Copy
    </button>
  ),
}));

describe('CodeSnippetHeader', () => {
  const mockOnToggleWrap = vi.fn();

  const defaultProps = {
    title: 'Example Snippet',
    copyContent: '{\n  "key": "value"\n}',
    translations: {
      copyButtonLabel: 'Copy code',
      copiedButtonLabel: 'Code copied',
      copyButtonTooltip: 'Copy to clipboard',
      wrapCodeButtonLabel: 'Wrap code',
      unwrapCodeButtonLabel: 'Unwrap code',
    },
    wrapCode: false,
    onToggleWrap: mockOnToggleWrap,
  };

  beforeEach(() => {
    mockOnToggleWrap.mockClear();
  });

  it('should render the title', () => {
    render(<CodeSnippetHeader {...defaultProps} />);

    expect(screen.getByText('Example Snippet')).toBeInTheDocument();
  });

  it('should render CopyButton with correct props', () => {
    render(<CodeSnippetHeader {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-button');

    expect(copyButton).toHaveAttribute('data-title', 'Example Snippet');
    expect(copyButton).toHaveAttribute(
      'data-copy-content',
      '{\n  "key": "value"\n}',
    );
    expect(copyButton).toHaveAttribute('data-copy-label', 'Copy code');
    expect(copyButton).toHaveAttribute('data-copied-label', 'Code copied');
  });

  it('should pass different translations to CopyButton', () => {
    const customTranslations = {
      copyButtonLabel: 'Kopier kode',
      copiedButtonLabel: 'Kode kopiert',
      copyButtonTooltip: 'Kopier til utklippstavle',
      wrapCodeButtonLabel: 'Aktiver linjeskift',
      unwrapCodeButtonLabel: 'Deaktiver linjeskift',
    };

    render(
      <CodeSnippetHeader {...defaultProps} translations={customTranslations} />,
    );

    const copyButton = screen.getByTestId('copy-button');

    expect(copyButton).toHaveAttribute('data-copy-label', 'Kopier kode');
    expect(copyButton).toHaveAttribute('data-copied-label', 'Kode kopiert');
  });

  it('should render wrap toggle button', () => {
    render(<CodeSnippetHeader {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Wrap code' }),
    ).toBeInTheDocument();
  });

  it('should call onToggleWrap when wrap button is clicked', async () => {
    const user = userEvent.setup();
    render(<CodeSnippetHeader {...defaultProps} />);

    const wrapButton = screen.getByRole('button', { name: 'Wrap code' });
    await user.click(wrapButton);

    expect(mockOnToggleWrap).toHaveBeenCalledTimes(1);
  });

  it('should show unwrap label when wrapCode is true', () => {
    render(<CodeSnippetHeader {...defaultProps} wrapCode={true} />);

    expect(
      screen.getByRole('button', { name: 'Unwrap code' }),
    ).toBeInTheDocument();
  });
});
