import { Config as LanguageConfig } from '../../util/config/configType';
import { normalizeBaseApplicationPath } from '../pathUtil';

/**
 * Extracts the actual path without language prefix and generates the correct path for the target language
 * @param pathname Current pathname from location
 * @param targetLanguage The language to switch to
 * @param supportedLanguages List of supported languages
 * @param defaultLanguage The fallback language code
 * @param showDefaultLanguageInPath Whether to show the default language in the path
 * @returns The correct path for the target language
 */
export const getLanguagePath = (
  pathname: string,
  targetLanguage: string,
  supportedLanguages: LanguageConfig['language']['supportedLanguages'],
  defaultLanguage: string,
  showDefaultLanguageInPath: boolean,
  baseApplicationPath: LanguageConfig['baseApplicationPath'],
): string => {
  const normalizedBase = normalizeBaseApplicationPath(baseApplicationPath);
  const basePrefix = normalizedBase === '/' ? '' : normalizedBase.slice(0, -1);
  let pathnameWithoutBase = pathname;

  if (normalizedBase !== '/') {
    if (pathnameWithoutBase === basePrefix) {
      pathnameWithoutBase = '/';
    } else if (pathnameWithoutBase.startsWith(normalizedBase)) {
      pathnameWithoutBase = pathnameWithoutBase.slice(
        normalizedBase.length - 1,
      );
    }
  }

  if (!pathnameWithoutBase.startsWith('/')) {
    pathnameWithoutBase = `/${pathnameWithoutBase}`;
  }

  const [firstURLElement, ...pathParts] = pathnameWithoutBase
    .slice(1)
    .split('/');
  const isLanguagePath = supportedLanguages.some(
    (lang) => lang.shorthand === firstURLElement,
  );

  const actualPath = isLanguagePath
    ? pathParts.join('/')
    : [firstURLElement, ...pathParts].join('/');

  const languagePath =
    !showDefaultLanguageInPath && targetLanguage === defaultLanguage
      ? `/${actualPath}`
      : `/${targetLanguage}/${actualPath}`;

  return `${basePrefix}${languagePath}`;
};
