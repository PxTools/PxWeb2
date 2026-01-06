import { useLocation, useMatch } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

import { getConfig } from '../config/getConfig';
import useApp from '../../context/useApp';
import { normalizeBaseApplicationPath } from '../pathUtil';
import { getLanguagePath } from '../language/getLanguagePath';

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

  const config = getConfig();
  const basePath = normalizeBaseApplicationPath(config.baseApplicationPath);
  const basePrefix = basePath === '/' ? '' : basePath.slice(0, -1);
  const languagePositionInPath =
    config.language.languagePositionInPath ?? 'after';

  // Try to match both with and without lang in path
  const matchWithLang = useMatch(
    languagePositionInPath === 'before'
      ? `/:lang${basePrefix}/table/:tableId`
      : `${basePrefix}/:lang/table/:tableId`,
  );
  const matchWithoutLang = useMatch(`${basePrefix}/table/:tableId`);

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
  const languagePositionInPath =
    config.language.languagePositionInPath ?? 'after';

  interface SupportedLanguage {
    shorthand: string;
  }

  return (
    <>
      {supportedLanguages.map((lang: SupportedLanguage) => {
        const targetPath = getLanguagePath(
          location.pathname,
          lang.shorthand,
          supportedLanguages,
          defaultLanguage,
          showDefaultLanguageInPath,
          config.baseApplicationPath,
          languagePositionInPath,
        );

        const cleanPath = removeTrailingSlash(targetPath);
        const langUrl = `${globalThis.location.origin}${cleanPath}`;
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
