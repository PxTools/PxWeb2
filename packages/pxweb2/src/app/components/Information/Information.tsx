import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import { Ingress } from '@pxweb2/pxweb2-ui';
import styles from './Information.module.scss';

export const Information = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.information}>
      <div className={cl(styles['heading-large'])}>
        {t('start_page.header')}
      </div>
      <Ingress>{t('start_page.ingress')}</Ingress>
    </div>
  );
};
