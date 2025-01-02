import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import App from './app';
import { AppProvider } from './context/AppProvider';

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
      <MemoryRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </MemoryRouter>,
    );

    expect(baseElement).toBeTruthy();
  });
});
