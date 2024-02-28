import i18n from 'i18next';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

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
    lng: 'en',
    fallbackLng: 'en',
    // Explicitly tell i18next our
    // supported locales.
    supportedLngs: ['en', 'no', 'sv', 'ar'],
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
