import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(Backend) // lazy loads translations from /public/locales
  .use(LanguageDetector) // detect user language
  .init({
    fallbackLng: 'en',
  supportedLngs: ['en', 'no', 'se', 'ar', 'jp'],
  // Disable i18next debug logging to keep console clean.
  debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      caches: [], // Do not cache the language in local storage or cookies.
    },
  });

export default i18n;
