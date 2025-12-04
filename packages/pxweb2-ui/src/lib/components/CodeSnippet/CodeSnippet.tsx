import cl from 'clsx';
import { useEffect, useState, useRef } from 'react';

import styles from './CodeSnippet.module.scss';
import Button from '../Button/Button';
import { highlightCode } from './highlightCode';

export type HighlightOptions = 'none' | 'json';

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
  readonly highlight: HighlightOptions;
}

function CodeSnippetBody({ children, highlight }: CodeSnippetBodyProps) {
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  const preRef = useRef<HTMLPreElement>(null);
  const codeOutput = highlightCode(children, highlight);
  const sanitizedCodeOutput = { __html: codeOutput };

  useEffect(() => {
    function checkOverflow() {
      if (preRef.current) {
        const hasVerticalOverflow =
          preRef.current.scrollHeight > preRef.current.clientHeight;

        setHasOverflow(hasVerticalOverflow);
        setIsScrolledToBottom(false); // Reset scroll position state on content change
      }
    }

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    if (preRef.current) {
      resizeObserver.observe(preRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [children]);

  function handleScroll() {
    if (preRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = preRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance

      setIsScrolledToBottom(isAtBottom);
    }
  }

  const shouldHaveGradient = hasOverflow && !isScrolledToBottom;

  return (
    <div className={cl(styles['body'])}>
      <pre
        ref={preRef}
        onScroll={handleScroll}
        className={cl(
          styles['content-wrapper'],
          shouldHaveGradient && styles['linear-gradient-bottom'],
        )}
      >
        <code className={cl(styles['code'])}>
          <span dangerouslySetInnerHTML={sanitizedCodeOutput} />
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
//       What are the best practices for code blocks with syntax highlighting in React?
//       dangerouslySetInnerHTML or libraries?
// TODO: Ask design about max height and scrolling behavior and gradient
// TODO: Figure out accessibility considerations regarding focus and screen readers
//  copy button aria-labels etc.
//    copy button should announce when code is copied
//  code block accessibility

export function CodeSnippet({
  title,
  children,
  highlight = 'none',
  translations,
}: CodeSnippetProps) {
  return (
    <div className={cl(styles['code-snippet'], styles['code-medium'])}>
      <CodeSnippetHeader
        title={title}
        copyContent={children}
        translations={translations}
      />
      <CodeSnippetBody highlight={highlight}>{children}</CodeSnippetBody>
    </div>
  );
}
