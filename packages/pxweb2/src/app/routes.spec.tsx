import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import * as configModule from './util/config/getConfig';

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

vi.mock('./components/ErrorPage/ErrorPage', () => ({
  default: () => <div data-testid="error-page">Error Page</div>,
}));

vi.mock('./pages/NotFound/NotFound', () => ({
  NotFound: ({ type }: { type: string }) => (
    <div data-testid={`not-found-${type}`}>Not Found {type}</div>
  ),
}));

vi.mock('./pages/TopicIcons/TopicIcons', () => ({
  default: () => <div data-testid="topic-icons">Topic Icons</div>,
}));

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
    maxDataCells: 150000,
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
  };

  beforeEach(() => {
    vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);
  });

  describe('when showDefaultLanguageInPath is false', () => {
    let routerConfig: any[];

    beforeEach(async () => {
      mockConfig.language.showDefaultLanguageInPath = false;
      vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);

      // Reset modules and import the routerConfig with the current config
      vi.resetModules();
      const routesModule = await import('./routes');
      routerConfig = routesModule.routerConfig;
    });

    it('should render StartPage at root path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for /table/:tableId', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/table/12345'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });

    it('should render NotFound for non-existent paths', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/non-existent'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(
        screen.getByTestId('not-found-unsupported_language'),
      ).toBeInTheDocument();
    });

    it('should render TopicIcons for /topicIcons path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/topicIcons'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('topic-icons')).toBeInTheDocument();
    });

    it('should render StartPage for non-default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/no/'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for non-default language table path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/no/table/12345'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });
  });

  describe('when showDefaultLanguageInPath is true', () => {
    let routerConfig: any[];

    beforeEach(async () => {
      mockConfig.language.showDefaultLanguageInPath = true;
      vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);

      // Reset modules and import the routerConfig with the current config
      vi.resetModules();
      const routesModule = await import('./routes');
      routerConfig = routesModule.routerConfig;
    });

    it('should redirect from root path to default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/'],
      });

      render(<RouterProvider router={testRouter} />);

      // With showDefaultLanguageInPath=true, root should not show StartPage
      // but should redirect to /{defaultLanguage}/ instead
      expect(screen.queryByTestId('start-page')).not.toBeInTheDocument();
    });

    it('should render StartPage for default language path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/en/'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('start-page')).toBeInTheDocument();
    });

    it('should render TableViewer for default language table path', () => {
      const testRouter = createMemoryRouter(routerConfig, {
        initialEntries: ['/en/table/12345'],
      });

      render(<RouterProvider router={testRouter} />);
      expect(screen.getByTestId('table-viewer')).toBeInTheDocument();
    });
  });

  it('should handle error elements', async () => {
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Set up the mock config
    mockConfig.language.showDefaultLanguageInPath = false;
    vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);

    // Create a separate router for this test with a throwing component
    vi.resetModules();
    const StartPageMock = await import('./pages/StartPage/StartPage');
    const originalImplementation = StartPageMock.default;
    vi.mocked(StartPageMock.default).mockImplementation(ThrowingComponent);

    // Re-import router to get the version with the throwing component
    const { routerConfig: errorRouterConfig } = await import('./routes');

    const testRouter = createMemoryRouter(errorRouterConfig, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={testRouter} />);
    expect(screen.getByTestId('error-page')).toBeInTheDocument();

    // Restore original implementation
    vi.mocked(StartPageMock.default).mockImplementation(originalImplementation);

    // Restore console.error
    console.error = originalConsoleError;
  });

  it('should support dynamic imports for route components', async () => {
    // Set up the config properly
    mockConfig.language.showDefaultLanguageInPath = false;
    vi.mocked(configModule.getConfig).mockReturnValue(mockConfig);

    // Reset modules and get a fresh routerConfig
    vi.resetModules();
    const { routerConfig: dynamicRouterConfig } = await import('./routes');

    const testRouter = createMemoryRouter(dynamicRouterConfig, {
      initialEntries: ['/'],
    });

    render(<RouterProvider router={testRouter} />);
    // Wait for any lazy loaded components to render
    expect(await screen.findByTestId('start-page')).toBeInTheDocument();
  });
});
