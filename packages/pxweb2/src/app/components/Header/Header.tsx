import cl from 'clsx';
import { useTranslation } from 'react-i18next';

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
  const lang = i18n.language;
  const homePageUrl = config.homePage?.[lang]?.trim() || '';
  const defaultPath = getLanguagePath(
    '/',
    lang,
    config.language.supportedLanguages,
    config.language.defaultLanguage,
    config.language.showDefaultLanguageInPath,
    config.baseApplicationPath,
    config.language.positionInPath,
  );
  const logoUrl = homePageUrl || defaultPath;

  return (
    <header className={cl(styles.header, { [styles.stroke]: stroke })}>
      <div className={styles.logoContainer}>
        <a href={logoUrl}>
          <MainLogo />
        </a>
      </div>

      <LanguageSwitcher />
    </header>
  );
};
