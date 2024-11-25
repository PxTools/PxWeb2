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
        <Heading size="medium">{t('common.header.title')}</Heading>
      </div>
      <div>
        {config.language.supportedLanguages.map(
          (language) =>
            i18n.language !== language.shorthand && (
              <Button
                variant="tertiary"
                onClick={() => i18n.changeLanguage(language.shorthand)}
                key={language.shorthand}
              >
                {language.languageName}
              </Button>
            ),
        )}
      </div>
    </div>
  );
};
