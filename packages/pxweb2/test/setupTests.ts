import React from 'react';
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

// Mock motion/react components to avoid DOM access issues in tests
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('motion/react', () => ({
  LazyMotion: ({ children }: { children: React.ReactNode }) => children,
  MotionConfig: ({ children }: { children: React.ReactNode }) => children,
  LayoutGroup: ({ children }: { children: React.ReactNode }) => children,
  m: {
    div: ({ children, className, ...props }: any) => {
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
    button: ({ children, className, ...props }: any) => {
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
    span: ({ children, className, ...props }: any) => {
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
    div: ({ children, className, ...props }: any) => {
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
    button: ({ children, className, ...props }: any) => {
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
    span: ({ children, className, ...props }: any) => {
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
