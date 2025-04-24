import { MemoryRouter } from 'react-router';
import StartPage from './StartPage';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { renderWithProviders } from '../../util/testing-utils';
import { Config } from '../../util/config/configType';

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
  apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  maxDataCells: 100000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};

describe('StartPage', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
