import { vi, beforeEach } from 'vitest';

// Disable CSS animations and transitions in tests for faster execution
beforeEach(() => {
  const style = document.createElement('style');
  style.innerHTML = `
    *,
    *::before,
    *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
    }
  `;
  document.head.appendChild(style);
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      // Basic interpolation for the few tests that might depend on values
      if (options) {
        return Object.keys(options).reduce(
          (acc, k) =>
            acc.replace(
              new RegExp(`{{\\s*${k}\\s*}}`, 'g'),
              String(options[k]),
            ),
          key,
        );
      }
      return key;
    },
    i18n: {
      changeLanguage: () => new Promise(vi.fn()),
    },
  }),
  Trans: ({ i18nKey, values, children }: any) => {
    if (i18nKey) {
      let rendered = i18nKey;
      if (values) {
        Object.keys(values).forEach((k) => {
          rendered = rendered.replace(
            new RegExp(`{{\\s*${k}\\s*}}`, 'g'),
            String(values[k]),
          );
        });
      }
      return rendered;
    }
    return children ?? null;
  },
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));
