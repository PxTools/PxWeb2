import cl from 'clsx';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';

import styles from './CodeSnippet.module.scss';
import Button from '../Button/Button';
import { getHighlighter } from './highlighter';

export type HighlightOptions = 'text' | 'json';

interface CopyButtonProps {
  readonly title: string;
  readonly copyContent: string;
  readonly translations: { copyButtonLabel: string; copiedButtonLabel: string };
}

function CopyButton({ copyContent, title, translations }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyText = translations.copyButtonLabel + title;
  const copiedText = translations.copiedButtonLabel;

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
      aria-label={hasCopied ? copiedText : copyText}
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
      <CopyButton
        title={title}
        copyContent={copyContent}
        translations={translations}
      />
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
  const shouldHaveGradient = hasOverflow && !isScrolledToBottom;
  const highlighter = getHighlighter();

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

  const handleScroll = useCallback(() => {
    if (preRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = preRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance

      setIsScrolledToBottom(isAtBottom);
    }
  }, []);

  // Generate HAST from code using Shiki highlighter - memoized to prevent re-creation on scroll state changes
  const hast = useMemo(
    () =>
      highlighter.codeToHast(children, {
        lang: highlight,
        theme: 'github-light',
      }),
    [children, highlight, highlighter],
  );

  // Convert HAST to React elements with custom component overrides
  // Memoized to prevent recreating the element tree when only scroll state changes
  const reactElement = useMemo(
    () =>
      toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
        components: {
          pre: (props) => (
            <pre
              {...props}
              ref={preRef}
              onScroll={handleScroll}
              className={cl(props.className, styles['content-wrapper'])}
            />
          ),
          code: (props) => (
            <code {...props} className={cl(props.className, styles['code'])} />
          ),
        },
      }),
    [hast, handleScroll],
  );

  // Update tabIndex on the pre element without recreating it
  useEffect(() => {
    if (preRef.current) {
      if (hasOverflow) {
        preRef.current.setAttribute('tabindex', '0');
      } else {
        preRef.current.removeAttribute('tabindex');
      }
    }
  }, [hasOverflow]);

  return (
    <div
      className={cl(
        styles['code-snippet-body'],
        shouldHaveGradient && styles['linear-gradient-bottom'],
      )}
    >
      {reactElement}
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

export function CodeSnippet({
  title,
  children,
  highlight = 'text',
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
