import cl from 'clsx';

import styles from './CodeSnippetHeader.module.scss';
import { CopyButton } from '../CopyButton/CopyButton';

interface CodeSnippetHeaderProps {
  readonly title: string;
  readonly copyContent: string;
  readonly translations: {
    copyButtonLabel: string;
    copiedButtonLabel: string;
  };
}

export function CodeSnippetHeader({
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
