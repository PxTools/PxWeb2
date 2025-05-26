import { Link as LinkRouter, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import { Button } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const config = getConfig();
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState(i18n.language);

  // Force update when location changes,
  // to ensure the correct languages are displayed as links
  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [location.pathname, i18n.language]);

  return (
    <div>
      {config.language.supportedLanguages.map(
        (language) =>
          currentLang !== language.shorthand && (
            <LinkRouter
              to={getLanguagePath(
                location.pathname,
                language.shorthand,
                config.language.supportedLanguages,
                config.language.fallbackLanguage,
                config.language.showDefaultLanguageInPath,
              )}
              key={language.shorthand}
            >
              <Button
                variant="tertiary"
                onClick={() => i18n.changeLanguage(language.shorthand)}
              >
                {language.languageName}
              </Button>
            </LinkRouter>
          ),
      )}
    </div>
  );
};
