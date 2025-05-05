import { Link as LinkRouter, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { getLanguagePath } from '../../util/language/getLanguagePath';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const config = getConfig();
  const location = useLocation();

  return (
    <div>
      {config.language.supportedLanguages.map(
        (language) =>
          // Don't show the current language
          i18n.language !== language.shorthand && (
            <LinkRouter
              to={{
                pathname: getLanguagePath(
                  location.pathname,
                  language.shorthand,
                  config.language.supportedLanguages,
                  config.language.fallbackLanguage,
                ),
              }}
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
