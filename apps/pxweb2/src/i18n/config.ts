import i18n from 'i18next';
import HttpApi from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

i18n
  .use(HttpApi)
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    // Explicitly tell i18next our
    // supported locales.
    supportedLngs: ['en', 'no', 'sv'],
    debug: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
