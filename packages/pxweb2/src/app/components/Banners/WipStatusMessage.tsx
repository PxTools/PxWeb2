import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Alert } from '@pxweb2/pxweb2-ui';
import classes from './WipStatusMessage.module.scss';
import useApp from '../../context/useApp';

const SESSION_STORAGE_KEY = 'pxweb2.wip_status_message_dismissed';

type WipStatusMessageProps = {
  ref?: React.Ref<HTMLDivElement>;
};

export default function WipStatusMessage({
  ref,
}: Readonly<WipStatusMessageProps>) {
  const { t } = useTranslation();
  const { isBannerDismissed, setIsBannerDismissed } = useApp();

  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
    setIsBannerDismissed(true);
  }, [setIsBannerDismissed]);

  if (isBannerDismissed) {
    return null;
  }

  return (
    <Alert
      variant="info"
      closeButton={true}
      className={classes.welcomeAlert}
      onDismissed={handleDismiss}
      ref={ref}
    >
      {t('common.status_messages.welcome')}
    </Alert>
  );
}
