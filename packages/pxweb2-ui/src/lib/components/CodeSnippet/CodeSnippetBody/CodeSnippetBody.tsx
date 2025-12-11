import cl from 'clsx';
import { useEffect, useState, useRef, ComponentPropsWithoutRef } from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { toJsxRuntime, Components } from 'hast-util-to-jsx-runtime';
import type { Root } from 'hast';

import styles from './CodeSnippetBody.module.scss';
import { HighlightOptions } from '../CodeSnippet';
import { getHighlighter } from '../highlighter';

// Custom components for use with hast-util-to-jsx-runtime
function Pre({
  className,
  ...props
}: Readonly<ComponentPropsWithoutRef<'pre'>>) {
  return (
    <pre {...props} className={cl(className, styles['content-wrapper'])} />
  );
}
function Code({
  className,
  ...props
}: Readonly<ComponentPropsWithoutRef<'code'>>) {
  return <code {...props} className={cl(className, styles['code'])} />;
}

// Components object for hast-util-to-jsx-runtime - defined outside to avoid recreation
const hastComponents: Components = {
  pre: Pre,
  code: Code,
};

interface CodeSnippetBodyProps {
  readonly children: string;
  readonly highlight: HighlightOptions;
}
export function CodeSnippetBody({ children, highlight }: CodeSnippetBodyProps) {
  const [hast, setHast] = useState<Root | null>(null);
  const preRef = useRef<HTMLPreElement | null>(null);

  // Load highlighter and generate HAST asynchronously
  useEffect(() => {
    let cancelled = false;

    getHighlighter().then((highlighter) => {
      if (cancelled) {
        return;
      }

      const result = highlighter.codeToHast(children, {
        lang: highlight,
        theme: 'github-light',
      });

      setHast(result);
    });

    return () => {
      cancelled = true;
    };
  }, [children, highlight]);

  // Handle overflow detection and tabindex
  useEffect(() => {
    if (!preRef.current) {
      return;
    }
    const preElement = preRef.current;

    function updateTabindex() {
      const hasOverflow = preElement.scrollHeight > preElement.clientHeight;

      // Update tabindex based on overflow
      if (hasOverflow) {
        preElement.setAttribute('tabindex', '0');
      } else {
        preElement.removeAttribute('tabindex');
      }
    }

    updateTabindex();

    const resizeObserver = new ResizeObserver(updateTabindex);
    resizeObserver.observe(preElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [hast]);

  // Convert HAST to React elements with custom component overrides
  // Show raw code as fallback while highlighter is loading to avoid layout shift
  const reactElement = hast ? (
    toJsxRuntime(hast, {
      Fragment,
      jsx,
      jsxs,
      components: hastComponents,
    })
  ) : (
    <Pre>
      <Code>{children}</Code>
    </Pre>
  );

  return (
    <div
      ref={(el) => {
        const preElement = el?.querySelector('pre');
        if (preElement) {
          preRef.current = preElement;
        }
      }}
      className={styles['code-snippet-body']}
      dir="ltr" // Ensure LTR direction for code readability
    >
      {reactElement}
    </div>
  );
}
