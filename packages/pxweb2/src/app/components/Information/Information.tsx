import { useTranslation } from 'react-i18next';

import { Heading, Ingress } from '@pxweb2/pxweb2-ui';
import styles from './Information.module.scss';

export const Information = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.information}>
      <Heading size="large" level="1" className={styles.title}>
        {t('start_page.header')}
      </Heading>
      <Ingress>{t('start_page.ingress')}</Ingress>
    </div>
  );
};
