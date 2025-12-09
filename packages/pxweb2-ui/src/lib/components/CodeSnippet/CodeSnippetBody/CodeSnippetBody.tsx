import cl from 'clsx';
import {
  useEffect,
  useState,
  useRef,
  useMemo,
  ComponentPropsWithoutRef,
} from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { toJsxRuntime, Components } from 'hast-util-to-jsx-runtime';

import styles from './CodeSnippetBody.module.scss';
import { HighlightOptions } from '../CodeSnippet';
import { getHighlighter } from '../highlighter';

// Custom components for use with hast-util-to-jsx-runtime
function Pre({ className, ...props }: ComponentPropsWithoutRef<'pre'>) {
  return (
    <pre {...props} className={cl(className, styles['content-wrapper'])} />
  );
}
function Code({ className, ...props }: ComponentPropsWithoutRef<'code'>) {
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
  const [showGradient, setShowGradient] = useState(false);
  const preRef = useRef<HTMLPreElement | null>(null);
  const highlighter = getHighlighter();

  const hast = useMemo(
    () =>
      highlighter.codeToHast(children, {
        lang: highlight,
        theme: 'github-light',
      }),
    [children, highlight, highlighter],
  );

  // Convert HAST to React elements with custom component overrides
  const reactElement = useMemo(
    () =>
      toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
        components: hastComponents,
      }),
    [hast],
  );

  // Handle overflow detection, scroll behavior, and tabindex
  useEffect(() => {
    if (!preRef.current) {
      return;
    }
    const preElement = preRef.current;

    function updateGradient() {
      const { scrollTop, scrollHeight, clientHeight } = preElement;
      const hasOverflow = scrollHeight > clientHeight;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 5; // 5px tolerance

      setShowGradient(hasOverflow && !isAtBottom);

      // Update tabindex based on overflow
      if (hasOverflow) {
        preElement.setAttribute('tabindex', '0');
      } else {
        preElement.removeAttribute('tabindex');
      }
    }

    updateGradient();
    preElement.addEventListener('scroll', updateGradient);

    const resizeObserver = new ResizeObserver(updateGradient);
    resizeObserver.observe(preElement);

    return () => {
      preElement.removeEventListener('scroll', updateGradient);
      resizeObserver.disconnect();
    };
  }, [reactElement]);

  return (
    <div
      ref={(el) => {
        const preElement = el?.querySelector('pre');
        if (preElement) {
          preRef.current = preElement;
        }
      }}
      className={cl(
        styles['code-snippet-body'],
        showGradient && styles['linear-gradient-bottom'],
      )}
    >
      {reactElement}
    </div>
  );
}
