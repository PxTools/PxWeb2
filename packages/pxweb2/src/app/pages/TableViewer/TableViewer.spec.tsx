import { MemoryRouter } from 'react-router';
import TableViewer from './TableViewer';
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
    showDefaultLanguageInPath: true,
  },
  apiUrl: '',
  maxDataCells: 100000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};

describe('TableViewer', () => {
  // Setup console mocks before all tests
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeAll(() => {
    // Suppress React error logging and component console.log
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restore console mocks
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <TableViewer />
        </MemoryRouter>
      </AccessibilityProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
