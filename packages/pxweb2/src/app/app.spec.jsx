import { render } from '@testing-library/react';

import App from './app';
import { MemoryRouter } from 'react-router';
import { AccessibilityProvider } from './context/AccessibilityProvider';

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
};

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AccessibilityProvider>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </AccessibilityProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
