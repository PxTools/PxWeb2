import { Link as LinkRouter, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

import { Button } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const config = getConfig();
  const location = useLocation();

  const [firstURLElement, ...pathParts] = location.pathname.slice(1).split('/');
  const isLanguagePath = config.language.supportedLanguages.some(
    (lang) => lang.shorthand === firstURLElement,
  );

  const actualPath = isLanguagePath
    ? pathParts.join('/')
    : [firstURLElement, ...pathParts].join('/');

  return (
    <div>
      {config.language.supportedLanguages.map(
        (language) =>
          // Don't show the current language
          i18n.language !== language.shorthand && (
            <LinkRouter
              to={{
                pathname:
                  language.shorthand === config.language.fallbackLanguage
                    ? `/${actualPath}`
                    : `/${language.shorthand}/${actualPath}`,
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
