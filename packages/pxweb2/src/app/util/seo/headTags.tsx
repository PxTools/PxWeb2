import { useLocation, useMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { getConfig } from '../config/getConfig';
import useApp from '../../context/useApp';

// Utility to remove trailing slash
function removeTrailingSlash(path: string) {
  return path.length > 0 ? path.replace(/\/$/, '') : path;
}

// Title and link tags will automatically be hoisted in the <head> section
// Renders the dynamic title based on the current route
// If the route matches "/:lang/table/:tableId" or /table/:tableId, it uses
// title from the context, which is set in ContentTop.tsx
// Otherwise, it defaults to the title from the translation file
export function Title() {
  const { t } = useTranslation();
  const { title } = useApp();

  // Try to match both with and without lang in path
  const matchWithLang = useMatch('/:lang/table/:tableId');
  const matchWithoutLang = useMatch('/table/:tableId');

  const tableId =
    matchWithLang?.params.tableId || matchWithoutLang?.params.tableId;

  const newTitle = tableId && title ? title : t('common.title');

  useEffect(() => {
    document.title = newTitle;
  }, [newTitle]);

  return null;
}

// Renders the canonical link tag
export function CanonicalUrl() {
  const location = useLocation();
  const cleanPath = removeTrailingSlash(location.pathname);
  const canonicalUrl = `${window.location.origin}${cleanPath}`;
  return <link rel="canonical" href={canonicalUrl} />;
}

// Renders hreflang alternate link tags
export function HrefLang() {
  const location = useLocation();
  const config = getConfig();
  const supportedLanguages = config.language.supportedLanguages;
  const showDefaultLanguageInPath = config.language.showDefaultLanguageInPath;
  const defaultLanguage = config.language.defaultLanguage;

  interface SupportedLanguage {
    shorthand: string;
  }

  function stripLangPrefix(pathname: string) {
    // Remove leading "/xx" where xx is a supported language code using RegExp
    const langCodes = supportedLanguages
      .map((lang: SupportedLanguage) => lang.shorthand)
      .join('|');
    const regex = new RegExp(`^/(${langCodes})(/|$)`, 'i');
    if (regex.test(pathname)) {
      return pathname.replace(regex, '/') || '/';
    }
    return pathname;
  }

  return (
    <>
      {supportedLanguages.map((lang: SupportedLanguage) => {
        const cleanPath = removeTrailingSlash(
          stripLangPrefix(location.pathname),
        );
        const langUrl =
          !showDefaultLanguageInPath && lang.shorthand === defaultLanguage
            ? `${window.location.origin}${cleanPath}`
            : `${window.location.origin}/${lang.shorthand}${cleanPath}`;
        return (
          <link
            key={lang.shorthand}
            rel="alternate"
            hrefLang={lang.shorthand}
            href={langUrl}
          />
        );
      })}
    </>
  );
}
