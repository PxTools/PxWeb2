import { Config as LanguageConfig } from '../../util/config/configType';
import { normalizeBaseApplicationPath } from '../pathUtil';

const buildPath = (prefix: string, actualPath: string) => {
  if (actualPath === '') {
    return prefix === '' ? '/' : `${prefix}/`;
  }
  return prefix === '' ? `/${actualPath}` : `${prefix}/${actualPath}`;
};

const normalizePathname = (pathname: string) =>
  pathname.startsWith('/') ? pathname : `/${pathname}`;

const stripBasePrefix = (
  pathname: string,
  normalizedBase: string,
  basePrefix: string,
) => {
  if (normalizedBase === '/') {
    return pathname;
  }

  if (pathname === basePrefix) {
    return '/';
  }

  if (pathname.startsWith(normalizedBase)) {
    return pathname.slice(normalizedBase.length - 1);
  }

  return pathname;
};

const getActualPathAfter = (
  pathname: string,
  supportedLanguages: LanguageConfig['language']['supportedLanguages'],
) => {
  const [firstURLElement, ...pathParts] = pathname.slice(1).split('/');
  const isLanguagePath = supportedLanguages.some(
    (lang) => lang.shorthand === firstURLElement,
  );

  return isLanguagePath
    ? pathParts.join('/')
    : [firstURLElement, ...pathParts].join('/');
};

const getActualPathBefore = (
  pathname: string,
  baseSegments: string[],
  supportedLanguages: LanguageConfig['language']['supportedLanguages'],
) => {
  // Split keeps trailing empty segment, preserving trailing slash semantics
  const pathSegments = pathname.slice(1).split('/');
  const firstSegment = pathSegments[0];
  const hasLangPrefix = supportedLanguages.some(
    (lang) => lang.shorthand === firstSegment,
  );

  const startsWith = (arr: string[], prefix: string[]) =>
    prefix.every((p, i) => arr[i] === p);

  if (hasLangPrefix) {
    const afterLang = pathSegments.slice(1);
    const rest = startsWith(afterLang, baseSegments)
      ? afterLang.slice(baseSegments.length)
      : afterLang;
    return rest.join('/');
  }

  const rest = startsWith(pathSegments, baseSegments)
    ? pathSegments.slice(baseSegments.length)
    : pathSegments;
  return rest.join('/');
};

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
  languagePositionInPath: LanguageConfig['language']['languagePositionInPath'] = 'after',
): string => {
  const normalizedBase = normalizeBaseApplicationPath(baseApplicationPath);
  const basePrefix = normalizedBase === '/' ? '' : normalizedBase.slice(0, -1);

  const includesLangSegment =
    showDefaultLanguageInPath || targetLanguage !== defaultLanguage;

  const baseSegments =
    normalizedBase === '/' ? [] : normalizedBase.slice(1, -1).split('/');

  const normalizedPath = normalizePathname(pathname);

  if (languagePositionInPath === 'before') {
    const actualPath = getActualPathBefore(
      normalizedPath,
      baseSegments,
      supportedLanguages,
    );
    const prefix = includesLangSegment
      ? `/${targetLanguage}${basePrefix}`
      : basePrefix;
    return buildPath(prefix, actualPath);
  }

  // languagePositionInPath === 'after'
  const pathnameWithoutBase = stripBasePrefix(
    normalizedPath,
    normalizedBase,
    basePrefix,
  );
  const actualPath = getActualPathAfter(
    pathnameWithoutBase,
    supportedLanguages,
  );
  const prefix = includesLangSegment
    ? `${basePrefix}/${targetLanguage}`
    : basePrefix;

  return buildPath(prefix, actualPath);
};
