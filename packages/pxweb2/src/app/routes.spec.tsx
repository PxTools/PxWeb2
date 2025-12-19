import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createMemoryRouter, RouteObject, RouterProvider } from 'react-router';

import * as configModule from './util/config/getConfig';
import { AppProvider } from './context/AppProvider';

// Define ThrowingComponent at the top level
const ThrowingComponent = () => {
  throw new Error('Test error');
};

vi.mock('./util/config/getConfig', () => ({
  getConfig: vi.fn(),
}));

// Mock the components to verify they're rendered
vi.mock('./pages/TableViewer/TableViewer', () => ({
  default: () => <div data-testid="table-viewer">Table Viewer</div>,
}));

vi.mock('./pages/StartPage/StartPage', () => ({
  default: () => <div data-testid="start-page">Start Page</div>,
}));

vi.mock('./pages/ErrorPage/ErrorPage', () => ({
  default: () => <div data-testid="error-page">Error Page</div>,
  ErrorPageWithLocalization: () => (
    <div data-testid="error-page-localized">Error Page with Localization</div>
  ),
}));

vi.mock('./pages/TopicIcons/TopicIcons', () => ({
  default: () => <div data-testid="topic-icons">Topic Icons</div>,
}));

vi.mock('./components/Errors/GenericError/GenericError', () => ({
  GenericError: () => <div data-testid="generic-error">Generic Error</div>,
}));

vi.mock('./context/useApp', () => ({
  default: () => ({
    title: '',
  }),
}));

// Function to wrap RouterProvider with AppProvider
function renderWithProviders(router: ReturnType<typeof createMemoryRouter>) {
  return render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
}

describe('Router configuration', () => {
  const mockConfig = {
    language: {
      supportedLanguages: [
        { shorthand: 'en', languageName: 'English' },
        { shorthand: 'no', languageName: 'Norwegian' },
      ],
      defaultLanguage: 'en',
      fallbackLanguage: 'en',
      showDefaultLanguageInPath: false,
    },
    apiUrl: 'test',
    baseApplicationPath: '/',
    showBreadCrumbOnStartPage: false,
    maxDataCells: 150000,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
    variableFilterExclusionList: {},
  };

  beforeEach(() => {
    vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
  });

  describe('when showDefaultLanguageInPath is false', () => {
    let routerConfig: RouteObject[];

    beforeEach(async () => {
      mockConfig.language.showDefaultLanguageInPath = false;

      // Reset modules and import the routerConfig with the current config
      vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
      vi.resetModules();

      const routesModule = await import('./routes');

      routerConfig = routesModule.routerConfig;
    });

    it('should render StartPage at root path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for /table/:tableId', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/table/12345'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });

    it('should render TopicIcons for /topicIcons path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/topicIcons'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('topic-icons')).toBeInTheDocument();
    });

    it('should render StartPage for non-default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/no/'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for non-default language table path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/no/table/12345'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });
  });

  describe('when showDefaultLanguageInPath is true', () => {
    let routerConfig: RouteObject[];

    beforeEach(async () => {
      mockConfig.language.showDefaultLanguageInPath = true;

      // Reset modules and import the routerConfig with the current config
      vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
      vi.resetModules();

      const routesModule = await import('./routes');

      routerConfig = routesModule.routerConfig;
    });

    it('should redirect from root path to default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/'],
      });

      renderWithProviders(testRouter);

      // When showDefaultLanguageInPath=true:
      // root path should redirect to /{defaultLanguage}/ and show StartPage
      expect(screen.queryByTestId('start-page')).toBeInTheDocument();
    });

    it('should render StartPage for default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/en/'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for default language table path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/en/table/12345'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });

    it('should render StartPage for non-default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/no/'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for non-default language table path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/no/table/12345'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });

    describe("when baseApplicationPath is '/app/'", () => {
      beforeEach(async () => {
        mockConfig.language.showDefaultLanguageInPath = true;
        mockConfig.baseApplicationPath = '/app/';

        vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
        vi.resetModules();

        const routesModule = await import('./routes');
        routerConfig = routesModule.routerConfig;
      });

      afterEach(() => {
        mockConfig.baseApplicationPath = '/';
      });

      it('should render StartPage for /app/en/', () => {
        const testRouter = createMemoryRouter(routerConfig, {
          initialEntries: ['/app/en/'],
        });

        renderWithProviders(testRouter);
        expect(screen.getByTestId('start-page')).toBeInTheDocument();
      });

      it('should render TableViewer for /app/no/table/:tableId', () => {
        const testRouter = createMemoryRouter(routerConfig, {
          initialEntries: ['/app/no/table/12345'],
        });

        renderWithProviders(testRouter);
        expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
      });
    });
  });

  it('should handle component errors with ErrorBoundary', async () => {
    // Suppress console output during error testing - automatically restored after test
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
    vi.spyOn(console, 'warn').mockImplementation(vi.fn());
    vi.spyOn(console, 'log').mockImplementation(vi.fn());

    // Set up the mock config
    mockConfig.language.showDefaultLanguageInPath = false;
    mockConfig.baseApplicationPath = '/';
    vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
    vi.doMock('./pages/StartPage/StartPage', () => ({
      default: ThrowingComponent,
    }));
    vi.resetModules(); // Reset modules to apply the new mock

    try {
      // Import router with the throwing component mock
      const { routerConfig: errorRouterConfig } = await import('./routes');

      const testRouter = createMemoryRouter(errorRouterConfig, {
        initialEntries: ['/'],
      });

      renderWithProviders(testRouter);
      expect(screen.getByTestId('generic-error')).toBeInTheDocument();
    } finally {
      // Reset the component mock
      vi.doMock('./pages/StartPage/StartPage', () => ({
        default: () => <div data-testid="start-page">Start Page</div>,
      }));
      vi.resetModules();
    }
  });
});
