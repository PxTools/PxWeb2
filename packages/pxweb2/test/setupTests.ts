import { vi } from 'vitest';

// Global mock for getConfig
vi.mock('../src/app/util/config/getConfig', () => ({
  getConfig: () => ({
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norsk' },
        { shorthand: 'sv', languageName: 'Svenska' },
        { shorthand: 'ar', languageName: 'العربية' },
      ],
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: true,
    },
    apiUrl: '',
    maxDataCells: 100000,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
  }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      changeLanguage: () => new Promise(() => {}),
      language: 'en',
      dir: () => 'ltr',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init: () => {},
  },
}));
