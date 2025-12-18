import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { GlobalAlert } from '@pxweb2/pxweb2-ui';
import classes from './WipStatusMessage.module.scss';

const SESSION_STORAGE_KEY = 'pxweb2.wip_status_message_dismissed';

export default function WipStatusMessage() {
  const { t } = useTranslation();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem(SESSION_STORAGE_KEY)
        : null;
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setIsDismissed(true);
  }, []);

  if (isDismissed) {
    return null;
  }

  return (
    <GlobalAlert
      variant="info"
      closeButton={true}
      className={classes.welcomeAlert}
      onDismissed={handleDismiss}
    >
      {t('common.status_messages.welcome')}
    </GlobalAlert>
  );
}
