import React from 'react';
import styles from './Header.module.scss';
import { Button } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const config = getConfig();
  return (
    <div className={styles.header}>
      <div>PXWEB2</div>
      <div className={styles.headerRight}>
        <div className={styles.desktopMenu}>
          <Button variant="tertiary" icon="House">
            {t('presentation_page.header.statistics')}
          </Button>
          <Button variant="tertiary" icon="Globe">
            {config.language.supportedLanguages.length +
              ' ' +
              t('presentation_page.header.languagebutton')}
          </Button>
          <Button variant="secondary" size="medium" icon="MagnifyingGlass">
            {t('presentation_page.header.searchbutton')}
          </Button>
        </div>
        <div className={styles.mobileMenu}>
          <Button variant="tertiary" icon="Menu" />
        </div>
      </div>
    </div>
  );
};
