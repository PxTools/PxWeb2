import { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalAlert, Link } from '@pxweb2/pxweb2-ui';
import classes from './WipStatusMessage.module.scss';
import ReactMarkdown from 'react-markdown';

const SESSION_STORAGE_KEY = 'pxweb2.wip_status_message_dismissed';

// Simple components to render markdown elements with custom styles and behavior
type SimpleChildrenProps = { children?: React.ReactNode };
type AnchorProps = { href?: string; children?: React.ReactNode };

function ParagraphRenderer({ children }: Readonly<SimpleChildrenProps>) {
  return <>{children}</>;
}

function AnchorRenderer({ href = '', children }: Readonly<AnchorProps>) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" inline>
      {children}
    </Link>
  );
}

type WipInlineMarkdownProps = {
  mdText: string;
};

function WipInlineMarkdown({ mdText }: Readonly<WipInlineMarkdownProps>) {
  const markdownComponents = useMemo(
    () => ({
      p: ParagraphRenderer,
      a: AnchorRenderer,
    }),
    [],
  );

  return (
    <ReactMarkdown components={markdownComponents} skipHtml={false}>
      {mdText}
    </ReactMarkdown>
  );
}

// Main component to display the WIP status message with dismiss functionality
export default function WipStatusMessage() {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed =
      globalThis.sessionStorage?.getItem(SESSION_STORAGE_KEY) ?? null;
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = useCallback(() => {
    globalThis.sessionStorage?.setItem(SESSION_STORAGE_KEY, 'true');
    setIsDismissed(true);
  }, []);

  if (isDismissed) {
    return null;
  }

  const message = t('common.status_messages.welcome', '');

  return (
    message && (
      <GlobalAlert
        id="wip-status-message"
        variant="info"
        closeButton={true}
        className={classes.welcomeAlert}
        onDismissed={handleDismiss}
      >
        <WipInlineMarkdown mdText={message} />
      </GlobalAlert>
    )
  );
}
