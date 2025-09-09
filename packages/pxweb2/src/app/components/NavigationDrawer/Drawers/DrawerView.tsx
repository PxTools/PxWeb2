import { useTranslation } from 'react-i18next';

import { ContentBox, Alert } from '@pxweb2/pxweb2-ui';
import classes from './DrawerView.module.scss';

export function DrawerView() {
  const { t } = useTranslation();

  return (
    <ContentBox>
      <Alert variant="info" className={classes.alert}>
        {t('common.status_messages.drawer_view')}
      </Alert>
    </ContentBox>
  );
}

DrawerView.displayName = 'DrawerView';
