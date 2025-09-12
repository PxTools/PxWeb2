import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

import { pxNumber } from './formatters';
import { getConfig } from '../app/util/config/getConfig';

export const defaultNS = 'translation';
const config = getConfig();

const supportedLanguages: string[] = config.language.supportedLanguages.map(
  (item) => item.shorthand,
);

const lookingForLanguagePos =
  (config.baseApplicationPath.match(/[\\/]/g) || []).length - 1;

const initPromise = i18n
  .use(HttpApi)
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    backend: {
      loadPath: `${config.baseApplicationPath}locales/{{lng}}/translation.json`,
    },
    fallbackLng: config.language.fallbackLanguage,
    defaultNS,
    // Explicitly tell i18next our supported locales.
    supportedLngs: supportedLanguages,
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['path'],
      lookupFromPathIndex: lookingForLanguagePos,
      caches: [], // Do not cache the language in local storage or cookies.
    },
  });

i18n.services.formatter?.add('pxNumber', pxNumber);

export { initPromise };
export default i18n;
