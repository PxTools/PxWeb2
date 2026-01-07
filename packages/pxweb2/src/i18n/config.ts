import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { pxNumber } from './formatters';
import pxDetector from './pxDetector';
import { getConfig } from '../app/util/config/getConfig';

// Add custom language detector to handle default language from config,
// so we can handle no language in path as default language.
const languageDetector = new LanguageDetector();
languageDetector.addDetector(pxDetector);

export const defaultNS = 'translation';
const config = getConfig();

const supportedLanguages: string[] = config.language.supportedLanguages.map(
  (item) => item.shorthand,
);

const positionInPath = config.language.positionInPath ?? 'after';

const lookingForLanguagePos =
  positionInPath === 'before'
    ? 0
    : (config.baseApplicationPath.match(/[\\/]/g) || []).length - 1;

const initPromise = i18n
  .use(HttpApi)
  .use(initReactI18next)
  .use(languageDetector)
  .init({
    backend: {
      loadPath: `${config.baseApplicationPath}locales/{{lng}}/translation.json?v=${__BUILD_DATE__}`,
    },
    fallbackLng: config.language.fallbackLanguage,
    defaultNS,
    // Explicitly tell i18next our supported locales.
    supportedLngs: supportedLanguages,
    // Disable i18next debug logging to prevent noisy console output.
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path', 'pxDetector'],
      lookupFromPathIndex: lookingForLanguagePos,
      caches: [], // Do not cache the language in local storage or cookies.
    },
  });

i18n.services.formatter?.add('pxNumber', pxNumber);

export { initPromise };
export default i18n;
