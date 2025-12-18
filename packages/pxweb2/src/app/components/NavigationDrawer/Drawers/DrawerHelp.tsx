import { useTranslation } from 'react-i18next';

import { ContentBox, LocalAlert } from '@pxweb2/pxweb2-ui';
import classes from './DrawerHelp.module.scss';

export function DrawerHelp() {
  const { t } = useTranslation();

  return (
    <ContentBox>
      <LocalAlert variant="info" className={classes.alert}>
        {t('common.status_messages.drawer_help')}
      </LocalAlert>
    </ContentBox>
  );
}

DrawerHelp.displayName = 'DrawerHelp';
