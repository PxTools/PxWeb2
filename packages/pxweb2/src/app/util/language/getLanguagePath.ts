import { Config as LanguageConfig } from '../../util/config/configType';

/**
 * Extracts the actual path without language prefix and generates the correct path for the target language
 * @param pathname Current pathname from location
 * @param targetLanguage The language to switch to
 * @param supportedLanguages List of supported languages
 * @param fallbackLanguage The fallback language code
 * @param showDefaultLanguageInPath Whether to show the default language in the path
 * @returns The correct path for the target language
 */
export const getLanguagePath = (
  pathname: string,
  targetLanguage: string,
  supportedLanguages: LanguageConfig['language']['supportedLanguages'],
  fallbackLanguage: string,
  showDefaultLanguageInPath: boolean,
): string => {
  const [firstURLElement, ...pathParts] = pathname.slice(1).split('/');
  const isLanguagePath = supportedLanguages.some(
    (lang) => lang.shorthand === firstURLElement,
  );

  const actualPath = isLanguagePath
    ? pathParts.join('/')
    : [firstURLElement, ...pathParts].join('/');

  if (!showDefaultLanguageInPath && targetLanguage === fallbackLanguage) {
    return `/${actualPath}`;
  }

  return `/${targetLanguage}/${actualPath}`;
};
