import cl from 'clsx';

import styles from './CodeSnippet.module.scss';
import { CodeSnippetHeader } from './CodeSnippetHeader/CodeSnippetHeader';
import { CodeSnippetBody } from './CodeSnippetBody/CodeSnippetBody';

export type HighlightOptions = 'text' | 'json';

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
