import { vi } from 'vitest';

const mockConfig = {
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      changeLanguage: () => new Promise(() => {}),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    init: () => {},
  },
};

export const mockReactI18next = () => {
  vi.mock('react-i18next', () => mockConfig);
};
