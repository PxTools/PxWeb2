import { vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

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

// Minimal react-i18next mock
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({
    i18nKey,
    children,
  }: {
    i18nKey?: string;
    children?: ReactNode;
  }) => {
    if (i18nKey) {
      return i18nKey;
    }
    return children ?? null;
  },
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));
