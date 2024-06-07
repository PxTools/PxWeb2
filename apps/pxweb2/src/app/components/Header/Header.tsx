import React from 'react';
import styles from './Header.module.scss';
import { Button, Heading } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const config = getConfig();

  return (
    <div className={styles.header}>
      <div>
        <Heading size="medium">PXWEB2</Heading>
      </div>
      <div className={styles.headerRight}>
        <div className={styles.desktopMenu}>
          <Button variant="tertiary" icon="House">
            {t('presentation_page.header.statistics')}
          </Button>
          {config.language.supportedLanguages.map((locale) => (
            <Button
              variant="tertiary"
              onClick={() => i18n.changeLanguage(locale)}
              key={locale}
            >
              {locale}
            </Button>
          ))}
          <Button variant="secondary" size="medium" icon="MagnifyingGlass">
            {t('common.generic_buttons.search')}
          </Button>
        </div>
        <div className={styles.mobileMenu}>
          <Button variant="tertiary" icon="Menu" />
        </div>
      </div>
    </div>
  );
};
