import { Suspense, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';

import './../style-dictionary/dist/css/variables.css';
import './../src/lib/global.scss';
import i18n from '../i18n/config';

// Create a global variable called locale in storybook
// and add a menu in the toolbar to change your locale
export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', title: 'English' },
        { value: 'no', title: 'Norsk' },
        { value: 'se', title: 'Svenska' },
        { value: 'ar', title: 'العربية' },
      ],
      showName: true,
    },
  },
};

// When The language changes, set the document direction
i18n.on('languageChanged', (locale) => {
  const direction = i18n.dir(locale);
  document.dir = direction;
});

// Component that handles locale changes
const I18nWrapper = ({ locale, children }) => {

  // When the locale global changes, set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>
        {children}
      </I18nextProvider>
    </Suspense>
  );
};

// Wrap the I18nextProvider component around the stories to provide translations
const withI18next = (Story, context) => {
  const { locale } = context.globals;
 
  return (
    <I18nWrapper locale={locale}>
      <Story />
    </I18nWrapper>
  );
};

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [withI18next],
  tags: ['autodocs']
};

export default preview;
