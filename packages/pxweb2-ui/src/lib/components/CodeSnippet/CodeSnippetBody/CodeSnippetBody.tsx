import cl from 'clsx';
import {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
  ComponentPropsWithoutRef,
  Ref,
} from 'react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { toJsxRuntime, Components } from 'hast-util-to-jsx-runtime';

import styles from './CodeSnippetBody.module.scss';
import { HighlightOptions } from '../CodeSnippet';
import { getHighlighter } from '../highlighter';

// Custom components for use with hast-util-to-jsx-runtime
function Pre({
  className,
  onScroll,
  ref,
  ...props
}: ComponentPropsWithoutRef<'pre'> & {
  onScroll?: () => void;
  ref?: Ref<HTMLPreElement>;
}) {
  return (
    <pre
      {...props}
      ref={ref}
      onScroll={onScroll}
      className={cl(className, styles['content-wrapper'])}
    />
  );
}
function Code({ className, ...props }: ComponentPropsWithoutRef<'code'>) {
  return <code {...props} className={cl(className, styles['code'])} />;
}

interface CodeSnippetBodyProps {
  readonly children: string;
  readonly highlight: HighlightOptions;
}
export function CodeSnippetBody({ children, highlight }: CodeSnippetBodyProps) {
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

  // Create components object with refs and handlers bound
  const components: Components = useMemo(
    () => ({
      pre: (props) => <Pre {...props} ref={preRef} onScroll={handleScroll} />,
      code: Code,
    }),
    [handleScroll],
  );

  // Convert HAST to React elements with custom component overrides
  // Memoized to prevent recreating the element tree when only scroll state changes
  const reactElement = useMemo(
    () =>
      toJsxRuntime(hast, {
        Fragment,
        jsx,
        jsxs,
        components,
      }),
    [hast, components],
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
