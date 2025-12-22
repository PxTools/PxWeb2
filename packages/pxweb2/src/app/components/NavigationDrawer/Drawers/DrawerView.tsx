import { useTranslation } from 'react-i18next';

import { ContentBox, LocalAlert } from '@pxweb2/pxweb2-ui';
import classes from './DrawerView.module.scss';

export function DrawerView() {
  const { t } = useTranslation();

  return (
    <ContentBox>
      <LocalAlert variant="info" className={classes.alert}>
        {t('common.status_messages.drawer_view')}
      </LocalAlert>
    </ContentBox>
  );
}

DrawerView.displayName = 'DrawerView';
