// Mock react-i18next's useTranslation hook
// needs to be imported before the component
import { mockReactI18next } from '@pxweb2/pxweb2-ui';
mockReactI18next();

import { MemoryRouter } from 'react-router';
import App from './app';
import { AccessibilityProvider } from './context/AccessibilityProvider';
import { renderWithProviders } from './util/testing-utils';
import { Config } from './util/config/configType';

// Declare the global variable for this file
declare global {
  interface Window {
    PxWeb2Config: Config;
  }
}

window.PxWeb2Config = {
  language: {
    supportedLanguages: [
      { shorthand: 'en', languageName: 'English' },
      { shorthand: 'no', languageName: 'Norsk' },
      { shorthand: 'sv', languageName: 'Svenska' },
      { shorthand: 'ar', languageName: 'العربية' },
    ],
    defaultLanguage: 'en',
    fallbackLanguage: 'en',
  },
  apiUrl: '',
};

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </AccessibilityProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
