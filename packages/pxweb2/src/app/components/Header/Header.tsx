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

function MainLogo() {
  const { t } = useTranslation();
  const srcPath = './images/logo.svg';

  return (
    <img
      className={cl(styles.logo)}
      src={srcPath}
      alt={t('common.header.logo_alt')}
    />
  );
}

export const Header = ({ stroke = false }: HeaderProps) => {
  const { i18n } = useTranslation();
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
          <MainLogo />
        </LinkRouter>
      </div>

      <LanguageSwitcher />
    </header>
  );
};
