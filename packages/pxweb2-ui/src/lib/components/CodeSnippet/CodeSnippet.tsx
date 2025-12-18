import cl from 'clsx';
import { useState } from 'react';

import styles from './CodeSnippet.module.scss';
import { CodeSnippetHeader } from './CodeSnippetHeader/CodeSnippetHeader';
import { CodeSnippetBody } from './CodeSnippetBody/CodeSnippetBody';

export type HighlightOptions = 'text' | 'json';
export interface CodeSnippetTranslations {
  copyButtonLabel: string;
  copiedButtonLabel: string;
  copyButtonTooltip: string;
  wrapCodeButtonLabel: string;
  unwrapCodeButtonLabel: string;
}

interface CodeSnippetProps {
  readonly title: string;
  readonly children: string;
  readonly highlight?: HighlightOptions;
  readonly maxHeight?: string;
  readonly translations: CodeSnippetTranslations;
}

export function CodeSnippet({
  title,
  children,
  highlight = 'text',
  maxHeight,
  translations,
}: CodeSnippetProps) {
  const [wrapCode, setWrapCode] = useState(false);

  function toggleWrap() {
    setWrapCode((prev) => !prev);
  }

  return (
    <div
      className={cl(styles['code-snippet'], styles['code-medium'])}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <CodeSnippetHeader
        title={title}
        copyContent={children}
        translations={translations}
        wrapCode={wrapCode}
        onToggleWrap={toggleWrap}
      />
      <CodeSnippetBody highlight={highlight} wrapCode={wrapCode}>
        {children}
      </CodeSnippetBody>
    </div>
  );
}
