import React from 'react';
import { vi } from 'vitest';
import type { Config } from '../src/app/util/config/configType';

// Polyfill: jsdom lacks ResizeObserver; mock minimal implementation for tests
class MockResizeObserver {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
// Assign to global scope if not already present
if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
}

// Types for motion props to avoid using 'any'
interface MotionProps extends React.HTMLAttributes<HTMLElement> {
  whileHover?: unknown;
  whileTap?: unknown;
  variants?: unknown;
  initial?: unknown;
  animate?: unknown;
  exit?: unknown;
  transition?: unknown;
  layout?: unknown;
  layoutId?: string;
  children?: React.ReactNode;
  className?: string;
}

export const mockedConfig: Config = {
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
    positionInPath: 'after',
  },
  baseApplicationPath: '/',
  apiUrl: '',
  maxDataCells: 100000,
  showBreadCrumbOnStartPage: true,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
  variableFilterExclusionList: {
    en: ['statisticalvariable', 'year', 'quarter', 'month', 'week'],
  },
};

vi.mock('../src/app/util/config/getConfig', () => {
  return {
    getConfig: vi.fn(() => mockedConfig),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => new Promise(vi.fn()),
      language: 'en',
      dir: () => 'ltr',
    },
  }),
  useRouteError: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

// Mock motion/react components to avoid DOM access issues in tests
vi.mock('motion/react', () => ({
  LazyMotion: ({ children }: { children: React.ReactNode }) => children,
  MotionConfig: ({ children }: { children: React.ReactNode }) => children,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => children,
  m: {
    div: ({ children, className, ...props }: MotionProps) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId,
        ...restProps
      } = props;
      void whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId;
      return React.createElement('div', { className, ...restProps }, children);
    },
    button: ({ children, className, ...props }: MotionProps) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId,
        ...restProps
      } = props;
      void whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId;
      return React.createElement(
        'button',
        { className, ...restProps },
        children,
      );
    },
    span: ({ children, className, ...props }: MotionProps) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId,
        ...restProps
      } = props;
      void whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId;
      return React.createElement('span', { className, ...restProps }, children);
    },
  },
  motion: {
    div: ({ children, className, ...props }: MotionProps) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId,
        ...restProps
      } = props;
      void whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId;
      return React.createElement('div', { className, ...restProps }, children);
    },
    button: ({ children, className, ...props }: MotionProps) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId,
        ...restProps
      } = props;
      void whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId;
      return React.createElement(
        'button',
        { className, ...restProps },
        children,
      );
    },
    span: ({ children, className, ...props }: MotionProps) => {
      // Filter out motion-specific props to avoid React warnings
      const {
        whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId,
        ...restProps
      } = props;
      void whileHover,
        whileTap,
        variants,
        initial,
        animate,
        exit,
        transition,
        layout,
        layoutId;
      return React.createElement('span', { className, ...restProps }, children);
    },
  },
}));
