import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import cl from 'clsx';

import { Icon, Label } from '@pxweb2/pxweb2-ui';
import useApp from '../../context/useApp';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';
import classes from './LanguageSwitcher.module.scss';

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();
  const isMobile = useApp().isMobile;
  const config = getConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isTabbed, setIsTabbed] = useState(false);

  // Force update the selects value(selected language) when location changes
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [location.pathname, i18n.language]);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    // Change the URL to the selected language path
    navigate(
      getLanguagePath(
        location.pathname,
        event.target.value,
        config.language.supportedLanguages,
        config.language.fallbackLanguage,
        config.language.showDefaultLanguageInPath,
      ),
    );

    // Change the language in i18n
    i18n.changeLanguage(event.target.value);
  };

  return (
    config.language.supportedLanguages.length > 1 && (
      <div
        className={cl(
          classes.languageSwitcher,
          classes[`textcolor-default`],
          isTabbed && classes['focusMarkings'],
        )}
      >
        <div className={cl(classes.languageSwitcherIconContainer)}>
          <Icon
            iconName="Globe"
            className={cl(
              classes.languageSwitcherIcon,
              classes[`label-medium`],
            )}
            ariaHidden
          />
        </div>

        {!isMobile && (
          <Label size="medium" forID="language-switcher" textcolor="inherit">
            {t('common.header.language_selector')}
          </Label>
        )}

        <select
          id="language-switcher"
          value={currentLang}
          className={cl(classes.languageSwitcherSelect)}
          aria-label={
            isMobile ? t('common.header.language_selector') : undefined
          }
          onKeyUp={(event) => {
            if (event.key === 'Tab' && !isTabbed) {
              setIsTabbed(true);
            }
          }}
          onBlur={() => {
            if (isTabbed) {
              setIsTabbed(false);
            }
          }}
          onChange={(event) => handleLanguageChange(event)}
        >
          {config.language.supportedLanguages.map((language) => (
            <option
              key={language.shorthand}
              lang={language.shorthand}
              value={language.shorthand}
            >
              {language.languageName}
            </option>
          ))}
        </select>
      </div>
    )
  );
};
