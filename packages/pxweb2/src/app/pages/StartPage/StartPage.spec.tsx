import { vi, Mock } from 'vitest';
import { MemoryRouter } from 'react-router';
import { waitFor, within, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import StartPage from './StartPage';
import type { StartPageState } from '../../pages/StartPage/StartPageTypes';
import type { Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { FilterContext } from '../../context/FilterContext';
import { useLocaleContent } from '../../util/hooks/useLocaleContent';
import { sortTablesByUpdated } from '../../util/startPageFilters';
import { renderWithProviders } from '../../util/testing-utils';
import * as startPageRender from '../../util/startPageRender';
import * as configModule from '../../util/config/getConfig';
import { getConfig } from '../../util/config/getConfig';
import { mockedConfig } from '../../../../test/setupTests';

// Mock screen size via useApp with mutable flags we can control per test
let mockIsMobile = false;
let mockIsTablet = false;
vi.mock('../../context/useApp', () => ({
  default: () => ({
    isMobile: mockIsMobile,
    isTablet: mockIsTablet,
    isInitialized: true,
  }),
}));

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
      {
        id: 'smallonly',
        small: <div data-testid="mock-icon-smallonly" />,
      },
      {
        id: 'mediumonly',
        medium: <div data-testid="mock-icon-mediumonly" />,
      },
    ],
  };
});

// Import the mocked hooks for use in the harness
import useApp from '../../context/useApp';
import { useTopicIcons } from '../../util/hooks/useTopicIcons';

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
const baseState: StartPageState = {
  filteredTables: [],
  availableTables: [],
  activeFilters: [],
  subjectOrderList: [],
  error: '',
  loading: false,
  availableFilters: {
    subjectTree: [],
    timeUnits: new Map<string, number>(),
    variables: new Map<string, number>(),
    status: new Map<'active' | 'discontinued', number>(),
    yearRange: { min: 0, max: 0 },
  },
  originalSubjectTree: [],
  lastUsedYearRange: null,
  availableTablesWhenQueryApplied: [],
};
const config = configModule.getConfig();

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
    config.language.showDefaultLanguageInPath = true;
    config.language.defaultLanguage = 'en';

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

    it('sort on updated DESC (newest first)', () => {
      const a = createTable({ id: 'a', updated: '2023-01-01T00:00:00Z' });
      const b = createTable({ id: 'b', updated: '2025-07-15T12:34:56Z' }); // newest
      const c = createTable({ id: 'c', updated: '2024-12-31T23:59:59Z' });

      const out = sortTablesByUpdated([a, b, c]);
      expect(out.map((t) => t.id)).toEqual(['b', 'c', 'a']);
    });

    it('places missing/invalid date at the bottom', () => {
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

    it('does not mutate the original array', () => {
      const a = createTable({ id: 'a', updated: '2024-01-01T00:00:00Z' });
      const b = createTable({ id: 'b', updated: '2025-01-01T00:00:00Z' });
      const input = [a, b];
      const snapshot = [...input];

      const out = sortTablesByUpdated(input);

      expect(input).toEqual(snapshot);
      expect(out).not.toBe(input);
    });

    it('handles ISO date without time', () => {
      const d1 = createTable({ id: 'd1', updated: '2024-05-01' });
      const d2 = createTable({ id: 'd2', updated: '2025-03-10' });

      const out = sortTablesByUpdated([d1, d2]);
      expect(out.map((t) => t.id)).toEqual(['d2', 'd1']);
    });

    it('preserves original order when updated is equal', () => {
      const a = createTable({ id: 'a', updated: '2025-01-01T00:00:00Z' });
      const b = createTable({ id: 'b', updated: '2025-01-01T00:00:00Z' });
      const c = createTable({ id: 'c', updated: '2025-01-01T00:00:00Z' });

      const out = sortTablesByUpdated([a, b, c]);
      expect(out.map((t) => t.id)).toEqual(['a', 'b', 'c']);
    });
  });

  describe('show breadcrumbs on startpage if set in config breadcrumbs', () => {
    beforeEach(() => {
      mockUseLocaleContent.mockReset();
    });

    it('Breadcrumb rendering with home page url when showBreadCrumbOnStartPage set to true and homepage set ', async () => {
      (getConfig as Mock).mockImplementation(() => ({
        ...mockedConfig,
        showBreadCrumbOnStartPage: true,
        homePage: {
          no: '', // Set to your Norwegian homepage URL
          sv: 'http://www.scb.se', // Set to your Swedish homepage URL
          en: 'http://www.scb.se/en/', // Set to your English homepage URL
        },
      }));

      const { findByRole } = renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <StartPage />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      expect(
        await findByRole('link', {
          name: 'common.breadcrumbs.breadcrumb_home_title',
        }),
      ).toBeInTheDocument();
      expect(
        await findByRole('link', {
          name: 'common.breadcrumbs.breadcrumb_root_title',
        }),
      ).toBeInTheDocument();
    });

    it('Do not render breadcrumbs on startpage when showBreadCrumbOnStartPage set to false,', async () => {
      (getConfig as Mock).mockImplementation(() => ({
        ...mockedConfig,
        showBreadCrumbOnStartPage: false,
      }));

      const { queryByRole } = renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <StartPage />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      // Wait for component to stabilize after async state updates
      await waitFor(() => {
        expect(
          queryByRole('link', {
            name: 'common.breadcrumbs.breadcrumb_root_title',
          }),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('renderNoResult', () => {
    beforeEach(() => {
      mockUseLocaleContent.mockReset();
      vi.spyOn(startPageRender, 'tableListIsReadyToRender').mockReturnValue(
        true,
      );
    });

    it('does not show no result header or text when one or more tables are present', async () => {
      mockUseLocaleContent.mockReturnValue({
        startPage: {
          noResultSearchHelp: {
            enabled: true,
            helpText: ['Tips 1', 'Tips 2'],
          },
        },
      });

      const { queryByText } = renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <StartPage />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(
          queryByText('start_page.no_result_header'),
        ).not.toBeInTheDocument();
        expect(
          queryByText('start_page.no_result_description'),
        ).not.toBeInTheDocument();
      });
    });

    it('shows help texts when noResultSearchHelp is enabled and helpText is provided', async () => {
      mockUseLocaleContent.mockReturnValue({
        startPage: {
          noResultSearchHelp: {
            enabled: true,
            helpText: ['Tips 1', 'Tips 2'],
          },
        },
      });

      const mockState: StartPageState = {
        ...baseState,
        filteredTables: [],
      };
      const mockDispatch = vi.fn();

      const { queryByText } = renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <FilterContext.Provider
              value={{ state: mockState, dispatch: mockDispatch }}
            >
              <StartPage />
            </FilterContext.Provider>
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(queryByText('Tips 1')).toBeInTheDocument();
        expect(queryByText('Tips 2')).toBeInTheDocument();
      });
    });

    it('does not show help texts when noResultSearchHelp is disabled or helpText is empty', async () => {
      mockUseLocaleContent.mockReturnValue({
        startPage: {
          noResultSearchHelp: {
            enabled: false,
            helpText: [''],
          },
        },
      });

      const { queryByText } = renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <StartPage />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(queryByText('Tips 1')).not.toBeInTheDocument();
        expect(queryByText('Tips 2')).not.toBeInTheDocument();
      });
    });
  });

  describe('getTopicIcon size selection', () => {
    // Minimal harness that reproduces the getTopicIcon logic using hooks
    function IconProbe({ table }: { table: Partial<Table> }) {
      const { isMobile, isTablet } = useApp();
      const isSmallScreen = isTablet === true || isMobile === true;
      const topicIconComponents = useTopicIcons();
      const topicId = table.subjectCode as string | undefined;
      const size = isSmallScreen ? 'small' : 'medium';
      const icon = topicId
        ? (topicIconComponents.find((i) => i.id === topicId)?.[size] ?? null)
        : null;

      return <div data-testid="probe">{icon}</div>;
    }

    beforeEach(() => {
      mockIsMobile = false;
      mockIsTablet = false;
    });

    it('returns small variant on small screens (mobile)', async () => {
      mockIsMobile = true;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'al' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-icon-small')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-icon-medium')).toBeNull();
    });

    it('returns medium variant on large screens (desktop)', async () => {
      mockIsMobile = false;
      mockIsTablet = false;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'al' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-icon-medium')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-icon-small')).toBeNull();
    });

    it('returns null when subjectCode is missing', async () => {
      mockIsMobile = false;
      mockIsTablet = false;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{}} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        // probe renders but contains no icon
        expect(screen.getByTestId('probe').firstChild).toBeNull();
      });
      expect(screen.queryByTestId('mock-icon-small')).toBeNull();
      expect(screen.queryByTestId('mock-icon-medium')).toBeNull();
    });

    it('returns null when subjectCode does not match any icon', async () => {
      mockIsMobile = false;
      mockIsTablet = false;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'notfound' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('probe').firstChild).toBeNull();
      });
    });

    it('returns small-only icon on small screens when available', async () => {
      mockIsMobile = true;
      mockIsTablet = false;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'smallonly' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-icon-smallonly')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-icon-mediumonly')).toBeNull();
    });

    it('returns null on desktop when only small variant exists', async () => {
      mockIsMobile = false;
      mockIsTablet = false;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'smallonly' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('probe').firstChild).toBeNull();
      });
    });

    it('returns null on mobile when only medium variant exists', async () => {
      mockIsMobile = true;
      mockIsTablet = false;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'mediumonly' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('probe').firstChild).toBeNull();
      });
    });

    it('uses tablet flag to select small variant', async () => {
      mockIsMobile = false;
      mockIsTablet = true;

      renderWithProviders(
        <AccessibilityProvider>
          <MemoryRouter>
            <IconProbe table={{ subjectCode: 'al' }} />
          </MemoryRouter>
        </AccessibilityProvider>,
      );

      await waitFor(() => {
        expect(screen.getByTestId('mock-icon-small')).toBeInTheDocument();
      });
      expect(screen.queryByTestId('mock-icon-medium')).toBeNull();
    });
  });
});
