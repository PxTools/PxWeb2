import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { Link as LinkRouter } from 'react-router';

import styles from './Header.module.scss';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';

interface HeaderProps {
  stroke?: boolean;
}

export const Header = ({ stroke = false }: HeaderProps) => {
  const { t, i18n } = useTranslation();
  const config = getConfig();

  return (
    <header className={cl(styles.header, { [styles.stroke]: stroke })}>
      <div className={styles.logoContainer}>
        <LinkRouter
          to={getLanguagePath(
            '/',
            i18n.language,
            config.language.supportedLanguages,
            config.language.fallbackLanguage,
            config.language.showDefaultLanguageInPath,
          )}
        >
          <img
            className={cl(styles.logo)}
            src="/images/main_logo/logo.svg"
            alt={t('common.header.logo_alt')}
          />
        </LinkRouter>
      </div>

      <LanguageSwitcher />
    </header>
  );
};
