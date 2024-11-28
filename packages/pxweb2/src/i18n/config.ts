import i18n from 'i18next';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { pxNumber } from './formatters';
import { getConfig } from '../app/util/config/getConfig';

export const defaultNS = 'translation';
const config = getConfig();

const supportedLanguages: string[] = config.language.supportedLanguages.map(
  (item) => item.shorthand
);

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    backend: {
      requestOptions: {
        // Do not cache the response from the server. This is needed because site administrators
        // may want to change the translations without having to wait for the cache to expire.
        cache: 'no-store',
      },
    },
    lng: config.language.defaultLanguage,
    fallbackLng: config.language.fallbackLanguage,
    defaultNS,
    // Explicitly tell i18next our
    // supported locales.
    supportedLngs: supportedLanguages,
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

i18n.services.formatter?.add('pxNumber', pxNumber);

export default i18n;
