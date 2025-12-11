import { useState, useRef } from 'react';

import styles from './CopyButton.module.scss';
import Button from '../../Button/Button';
import { CodeSnippetTranslations } from '../CodeSnippet';

interface CopyButtonProps {
  readonly title: string;
  readonly copyContent: string;
  readonly translations: CodeSnippetTranslations;
}

export function CopyButton({
  copyContent,
  title,
  translations,
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyText = translations.copyButtonLabel + title;
  const copiedText = translations.copiedButtonLabel;
  const copyButtonTooltip = translations.copyButtonTooltip;
  const liveRegionText = hasCopied ? copiedText : '';
  const ariaLabel = hasCopied ? copiedText : copyText;

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
    <>
      <span
        aria-live="assertive"
        aria-atomic="true"
        className={styles['sr-only']}
      >
        {liveRegionText}
      </span>
      <Button
        aria-label={ariaLabel}
        title={copyButtonTooltip}
        className={hasCopied ? styles.hasCopied : undefined}
        onClick={copyToClipboard}
        size="medium"
        variant="tertiary"
        icon={hasCopied ? 'Check' : 'Copy'}
      />
    </>
  );
}
