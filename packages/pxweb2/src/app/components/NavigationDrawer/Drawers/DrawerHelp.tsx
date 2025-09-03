import { useTranslation } from 'react-i18next';

import { ContentBox, Alert } from '@pxweb2/pxweb2-ui';

export function DrawerHelp() {
  const { t } = useTranslation();

  return (
    <ContentBox>
      <Alert variant="info">{t('common.status_messages.drawer_help')}</Alert>
    </ContentBox>
  );
}

DrawerHelp.displayName = 'DrawerHelp';
