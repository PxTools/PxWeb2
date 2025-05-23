import { vi } from 'vitest';
import { Blob as FetchBlob } from 'fetch-blob';

// Always override, since jsdom's Blob lacks .stream()
globalThis.Blob = FetchBlob as unknown as typeof Blob;

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
