import { MemoryRouter } from 'react-router';
import StartPage from './StartPage';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { renderWithProviders } from '../../util/testing-utils';
import { Config } from '../../util/config/configType';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { waitFor, within } from '@testing-library/react';

// Mock the getAllTables function
vi.mock('../../util/tableHandler', () => ({
  getAllTables: vi.fn().mockResolvedValue([
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
      links: [],
    },
    {
      id: '13619',
      label:
        '13619: Personer, etter arbeidsstyrkestatus, kjønn og alder. Bruddjusterte tall 2009K1-2023K1',
      description: '',
      updated: '2023-04-11T06:00:00Z',
      firstPeriod: '2009K1',
      lastPeriod: '2023K1',
      category: 'public',
      variableNames: [
        'arbeidsstyrkestatus',
        'kjønn',
        'alder',
        'statistikkvariabel',
        'år',
      ],
      source: 'Statistisk sentralbyrå',
      timeUnit: 'Quarterly',
      paths: [
        [
          {
            id: 'al',
            label: 'Arbeid og lønn',
          },
        ],
      ],
      links: [],
    },
  ]),
}));

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

  it('renders the hidden SEO table list with correct number of links', async () => {
    const { findByRole } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    const heading = await findByRole('heading', {
      name: 'TableList(SEO)',
      hidden: true,
    });
    const nav = heading.closest('nav') as HTMLElement;
    expect(nav).toHaveAttribute('aria-hidden', 'true');
    const links = await within(nav).findAllByRole('link', { hidden: true });
    expect(links).toHaveLength(2);
    links.forEach((a) => expect(a).toHaveAttribute('tabindex', '-1'));
  });

  it('prefixes href with language when showDefaultLanguageInPath=true', async () => {
    window.PxWeb2Config.language.showDefaultLanguageInPath = true;
    window.PxWeb2Config.language.defaultLanguage = 'en';

    const { findByRole } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    const heading = await findByRole('heading', {
      name: 'TableList(SEO)',
      hidden: true,
    });
    const nav = heading.closest('nav') as HTMLElement;
    const links = await within(nav).findAllByRole('link', { hidden: true });
    links.forEach((a) => {
      expect(a).toHaveAttribute(
        'href',
        expect.stringMatching(/^\/en\/table\//),
      );
    });
  });
});
