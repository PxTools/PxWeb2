import { vi } from 'vitest';

export const mockReactI18next = () => {
  vi.mock('react-i18next', () => ({
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
  }));
};
