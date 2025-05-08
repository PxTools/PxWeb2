import { Config as LanguageConfig } from '../../util/config/configType';

/**
 * Extracts the actual path without language prefix and generates the correct path for the target language
 * @param pathname Current pathname from location
 * @param targetLanguage The language to switch to
 * @param supportedLanguages List of supported languages
 * @param fallbackLanguage The fallback language code
 * @returns The correct path for the target language
 */
export const getLanguagePath = (
  pathname: string,
  targetLanguage: string,
  supportedLanguages: LanguageConfig['language']['supportedLanguages'],
  fallbackLanguage: string,
): string => {
  const [firstURLElement, ...pathParts] = pathname.slice(1).split('/');
  const isLanguagePath = supportedLanguages.some(
    (lang) => lang.shorthand === firstURLElement,
  );

  const actualPath = isLanguagePath
    ? pathParts.join('/')
    : [firstURLElement, ...pathParts].join('/');

  return targetLanguage === fallbackLanguage
    ? `/${actualPath}`
    : `/${targetLanguage}/${actualPath}`;
};
