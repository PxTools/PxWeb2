import cl from 'clsx';
import { useState, useRef } from 'react';

import styles from './CodeSnippet.module.scss';
import Button from '../Button/Button';

type HighlightOptions = 'json';

interface CopyButtonProps {
  readonly copyContent: string;
  readonly translations: { copyButtonLabel: string; copiedButtonLabel: string };
}

function CopyButton({ copyContent, translations }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function copyToClipboard() {
    navigator.clipboard.writeText(copyContent).then(() => {
      setHasCopied(true);

      // Clear any existing timeout before setting a new one
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setHasCopied(false);
        timeoutRef.current = null;
      }, 3000);
    });
  }

  return (
    <Button
      aria-label={
        hasCopied
          ? translations.copiedButtonLabel
          : translations.copyButtonLabel
      }
      className={hasCopied ? styles.hasCopied : undefined}
      onClick={copyToClipboard}
      size="medium"
      variant="tertiary"
      icon={hasCopied ? 'Check' : 'Copy'}
    />
  );
}

interface CodeSnippetHeaderProps {
  readonly title: string;
  readonly copyContent: string;
  readonly translations: {
    copyButtonLabel: string;
    copiedButtonLabel: string;
  };
}

function CodeSnippetHeader({
  title,
  copyContent,
  translations,
}: CodeSnippetHeaderProps) {
  return (
    <div className={cl(styles['header'])}>
      <div className={cl(styles['header-title'])}>{title}</div>
      <CopyButton copyContent={copyContent} translations={translations} />
    </div>
  );
}

interface CodeSnippetBodyProps {
  readonly children: string;
  readonly highlight?: HighlightOptions;
}

function CodeSnippetBody({ children, highlight }: CodeSnippetBodyProps) {
  const shouldHaveGradient = true; // TODO: Placeholder for future logic
  let codeOutput = children;

  if (highlight === 'json') {
    // Add JSON syntax highlighting logic here in the future
    console.log('JSON highlighting not yet implemented for' + highlight);
  }

  return (
    <div className={cl(styles['body'])}>
      <pre className={cl(styles['content-wrapper'])}>
        <code
          className={cl(
            styles['code'],
            shouldHaveGradient && styles['linear-gradient-bottom'],
          )}
          tabIndex={0}
        >
          {codeOutput}
        </code>
      </pre>
    </div>
  );
}

interface CodeSnippetProps {
  readonly title: string;
  readonly children: string;
  readonly highlight?: HighlightOptions;
  readonly translations: {
    copyButtonLabel: string;
    copiedButtonLabel: string;
  };
}

// TODO: Add syntax highlighting
// TODO: Ask design about max height and scrolling behavior and gradient
// TODO: Figure out accessibility considerations regarding focus and screen readers
//  copy button aria-labels etc.
//    copy button should announce when code is copied
//  code block accessibility

export function CodeSnippet({
  title,
  children,
  translations,
}: CodeSnippetProps) {
  return (
    <div className={cl(styles['code-snippet'], styles['code-medium'])}>
      <CodeSnippetHeader
        title={title}
        copyContent={children}
        translations={translations}
      />
      <CodeSnippetBody>{children}</CodeSnippetBody>
    </div>
  );
}
