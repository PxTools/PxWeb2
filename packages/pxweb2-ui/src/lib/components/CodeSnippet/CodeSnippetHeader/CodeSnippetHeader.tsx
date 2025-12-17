import cl from 'clsx';

import styles from './CodeSnippetHeader.module.scss';
import { CopyButton } from '../CopyButton/CopyButton';
import { Button } from '../../Button/Button';
import { CodeSnippetTranslations } from '../CodeSnippet';

interface CodeSnippetHeaderProps {
  readonly title: string;
  readonly copyContent: string;
  readonly translations: CodeSnippetTranslations;
  readonly wrapCode: boolean;
  readonly onToggleWrap: () => void;
}

export function CodeSnippetHeader({
  title,
  copyContent,
  translations,
  wrapCode,
  onToggleWrap,
}: CodeSnippetHeaderProps) {
  const wrapButtonText = wrapCode
    ? translations.unwrapCodeButtonLabel
    : translations.wrapCodeButtonLabel;

  return (
    <div className={cl(styles['header'])}>
      <div className={cl(styles['header-title'])}>{title}</div>
      <div className={cl(styles['header-buttons'])}>
        <Button
          aria-label={wrapButtonText}
          title={wrapButtonText}
          onClick={onToggleWrap}
          size="medium"
          variant="tertiary"
          icon={'LineBreak'}
        />
        <CopyButton
          title={title}
          copyContent={copyContent}
          translations={translations}
        />
      </div>
    </div>
  );
}
