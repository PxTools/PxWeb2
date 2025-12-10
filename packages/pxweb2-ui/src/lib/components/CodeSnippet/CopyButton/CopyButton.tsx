import { useState, useRef } from 'react';

import styles from './CopyButton.module.scss';
import Button from '../../Button/Button';

interface CopyButtonProps {
  readonly title: string;
  readonly copyContent: string;
  readonly translations: { copyButtonLabel: string; copiedButtonLabel: string };
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
        {ariaLabel}
      </span>
      <Button
        aria-label={ariaLabel}
        className={hasCopied ? styles.hasCopied : undefined}
        onClick={copyToClipboard}
        size="medium"
        variant="tertiary"
        icon={hasCopied ? 'Check' : 'Copy'}
      />
    </>
  );
}
