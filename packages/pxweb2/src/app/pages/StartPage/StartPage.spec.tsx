import { MemoryRouter } from 'react-router';
import StartPage from './StartPage';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { renderWithProviders } from '../../util/testing-utils';
import { Config } from '../../util/config/configType';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { waitFor } from '@testing-library/react';

// Mock the getFullTable function
vi.mock('../../util/tableHandler', () => {
  return {
    getFullTable: Promise.resolve([
      {
        id: '13618',
        label:
          '13618: Personer, etter arbeidsstyrkestatus, kjønn og alder. Bruddjusterte tall 2009-2022',
        description: '',
        updated: '2023-04-11T06:00:00Z',
        firstPeriod: '2009',
        lastPeriod: '2022',
        category: 'public',
        variableNames: [
          'arbeidsstyrkestatus',
          'kjønn',
          'alder',
          'statistikkvariabel',
          'år',
        ],
        source: 'Statistisk sentralbyrå',
        timeUnit: 'Annual',
        paths: [
          [
            {
              id: 'al',
              label: 'Arbeid og lønn',
            },
          ],
        ],
        links: [
          {
            rel: 'self',
            hreflang: 'no',
            href: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta/tables/13618?lang=no',
          },
          {
            rel: 'metadata',
            hreflang: 'no',
            href: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta/tables/13618/metadata?lang=no',
          },
          {
            rel: 'data',
            hreflang: 'no',
            href: 'https://data.qa.ssb.no/api/pxwebapi/v2-beta/tables/13618/data?lang=no&outputFormat=json-stat2',
          },
        ],
      },
    ]),
  };
});

vi.mock('../../util/hooks/useTopicIcons', () => {
  return {
    useTopicIcons: () => [
      {
        id: 'al',
        small: <div data-testid="mock-icon-small" />,
        medium: <div data-testid="mock-icon-medium" />,
      },
    ],
  };
});

vi.mock('react-i18next', async () => {
  const actual =
    await vi.importActual<typeof import('react-i18next')>('react-i18next');

  return {
    ...actual,
    useTranslation: () => ({
      t: (key: string) => key,
      i18n: {
        language: 'en',
      },
    }),
    Trans: (props: { i18nKey: string }) => <>{props.i18nKey}</>,
  };
});

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
  apiUrl: 'https://api.scb.se/OV0104/v2beta/api/v2',
  maxDataCells: 100000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
};

describe('StartPage', () => {
  it('should render successfully', async () => {
    const { baseElement } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );
    await waitFor(() => {
      expect(baseElement).toBeTruthy();
    });
  });

  it('renders translated search placeholder', async () => {
    const { getByPlaceholderText } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    await waitFor(() => {
      expect(
        getByPlaceholderText('start_page.search_placeholder'),
      ).toBeInTheDocument();
    });
  });

  it('renders default table count using Trans', async () => {
    const { getByText } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    await waitFor(() => {
      expect(
        getByText('start_page.table.number_of_tables'),
      ).toBeInTheDocument();
    });
  });
});
