import { vi, Mock } from 'vitest';
import { MemoryRouter } from 'react-router';
import { waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import StartPage from './StartPage';
import type { Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Config } from '../../util/config/configType';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';
import { sortTablesByUpdated } from '../../util/startPageFilters';
import { renderWithProviders } from '../../util/testing-utils';

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

vi.mock('../../util/hooks/useLocaleContent', () => ({
  useLocaleContent: vi.fn(),
}));

const mockUseLocaleContent = useLocaleContent as Mock;

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
  baseApplicationPath: '/',
  maxDataCells: 100000,
  specialCharacters: ['.', '..', ':', '-', '...', '*'],
  variableFilterExclusionList: {
    en: ['ContentsCode', 'Tid'],
  },
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

describe('sortTablesByUpdated (date-only, newest first)', () => {
  const createTable = (overrides: Partial<Table> = {}): Table =>
    ({
      id: Math.random().toString(36).slice(2),
      label: overrides.label ?? 'Some table',
      updated: overrides.updated,
      firstPeriod: overrides.firstPeriod ?? '2000',
      lastPeriod: overrides.lastPeriod ?? '2001',
      timeUnit: overrides.timeUnit ?? 'Annual',
      variableNames: overrides.variableNames ?? [],
      source: overrides.source ?? 'SSB',
      paths: overrides.paths ?? [],
      ...overrides,
    }) as unknown as Table;

  it('sorterer på updated DESC (nyest først)', () => {
    const a = createTable({ id: 'a', updated: '2023-01-01T00:00:00Z' });
    const b = createTable({ id: 'b', updated: '2025-07-15T12:34:56Z' }); // nyest
    const c = createTable({ id: 'c', updated: '2024-12-31T23:59:59Z' });

    const out = sortTablesByUpdated([a, b, c]);
    expect(out.map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('plasserer manglende/ugyldig dato nederst', () => {
    const newest = createTable({
      id: 'newest',
      updated: '2025-08-05T06:00:00Z',
    });
    const invalid = createTable({
      id: 'invalid',
      updated: 'not-a-date' as unknown as string,
    });
    const missing = createTable({ id: 'missing', updated: undefined });

    const out = sortTablesByUpdated([invalid, newest, missing]);
    expect(out.map((t) => t.id)).toEqual(['newest', 'invalid', 'missing']);
  });

  it('muterer ikke original-arrayet', () => {
    const a = createTable({ id: 'a', updated: '2024-01-01T00:00:00Z' });
    const b = createTable({ id: 'b', updated: '2025-01-01T00:00:00Z' });
    const input = [a, b];
    const snapshot = [...input];

    const out = sortTablesByUpdated(input);

    expect(input).toEqual(snapshot);
    expect(out).not.toBe(input);
  });

  it('håndterer ISO-dato uten klokkeslett', () => {
    const d1 = createTable({ id: 'd1', updated: '2024-05-01' });
    const d2 = createTable({ id: 'd2', updated: '2025-03-10' });

    const out = sortTablesByUpdated([d1, d2]);
    expect(out.map((t) => t.id)).toEqual(['d2', 'd1']);
  });

  it('bevarer opprinnelig rekkefølge når updated er lik', () => {
    const a = createTable({ id: 'a', updated: '2025-01-01T00:00:00Z' });
    const b = createTable({ id: 'b', updated: '2025-01-01T00:00:00Z' });
    const c = createTable({ id: 'c', updated: '2025-01-01T00:00:00Z' });

    const out = sortTablesByUpdated([a, b, c]);
    expect(out.map((t) => t.id)).toEqual(['a', 'b', 'c']);
  });
});

describe('StartPage locale content: breadcrumbs', () => {
  beforeEach(() => {
    mockUseLocaleContent.mockReset();
  });
  it('Breadcrumb rendering on StartPage', async () => {
    mockUseLocaleContent.mockReturnValue({
      startPage: {
        breadCrumb: {
          enabled: true,
          items: [
            { label: 'Forsiden', href: '#' },
            { label: 'Statistikkbanken', href: '/' },
          ],
        },
      },
    });

    const { findByRole } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    expect(await findByRole('link', { name: 'Forsiden' })).toBeInTheDocument();
    expect(
      await findByRole('link', { name: 'Statistikkbanken' }),
    ).toBeInTheDocument();
  });

  it('does not render breadcrumbs when enabled is false', async () => {
    mockUseLocaleContent.mockReturnValue({
      startPage: {
        breadCrumb: {
          enabled: false,
          items: [
            { label: 'Forsiden', href: '#' },
            { label: 'Statistikkbanken', href: '/' },
          ],
        },
      },
    });

    const { queryByRole } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    // Wait for component to stabilize after async state updates
    await waitFor(() => {
      expect(queryByRole('link', { name: 'Forsiden' })).not.toBeInTheDocument();
    });
  });

  it('does not render breadcrumbs when breadCrumb is missing', async () => {
    mockUseLocaleContent.mockReturnValue({
      startPage: {},
    });

    const { queryByRole } = renderWithProviders(
      <AccessibilityProvider>
        <MemoryRouter>
          <StartPage />
        </MemoryRouter>
      </AccessibilityProvider>,
    );

    // Wait for component to stabilize after async state updates
    await waitFor(() => {
      expect(queryByRole('link', { name: 'Forsiden' })).not.toBeInTheDocument();
    });
  });
});
