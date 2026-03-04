import React from 'react';
import { act, waitFor, render } from '@testing-library/react';
import { vi } from 'vitest';

import {
  renderWithProviders,
  mockTableService,
} from '../../util/testing-utils';
import Selection from './Selection';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import {
  TableDataContext,
  TableDataProvider,
} from '../../context/TableDataProvider';
import { AppProvider } from '../../context/AppProvider';
import { VariablesProvider } from '../../context/VariablesProvider';
import { TablesService } from '@pxweb2/pxweb2-api-client';
import { mockedConfig } from '../../../../test/setupTests';

let mockResolvedLanguage = 'en';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: mockResolvedLanguage,
      resolvedLanguage: mockResolvedLanguage,
      dir: () => 'ltr',
    },
  }),
  useRouteError: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

describe('Selection', () => {
  mockTableService();

  beforeEach(() => {
    mockResolvedLanguage = 'en';
    mockedConfig.tableViewer = { selectionOnLanguageChange: 'reset' };
    vi.clearAllMocks();
  });

  it('should throw an error when triggered', () => {
    const TestComponent = () => {
      const context = React.useContext(TableDataContext);
      React.useEffect(() => {
        if (context) {
          throw new Error('Simulated error');
        }
      }, [context]);
      return null;
    };

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(vi.fn());
    expect(() => {
      renderWithProviders(<TestComponent />);
    }).toThrow('Simulated error');
    consoleErrorSpy.mockRestore();
  });

  it('should render successfully', async () => {
    let result: ReturnType<typeof renderWithProviders> | undefined;
    await act(async () => {
      result = renderWithProviders(
        <AccessibilityProvider>
          <Selection
            openedWithKeyboard={false}
            selectedNavigationView="none"
            selectedTabId="1"
            setSelectedNavigationView={vi.fn()}
          />
        </AccessibilityProvider>,
      );
    });

    expect(result!.baseElement).toBeTruthy();

    expect(() => {
      throw new Error('Simulated error');
    }).toThrow('Simulated error');
  });

  it('reloads default selection when language changes in reset mode', async () => {
    const view = (
      <AppProvider>
        <VariablesProvider>
          <TableDataProvider>
            <AccessibilityProvider>
              <Selection
                openedWithKeyboard={false}
                selectedNavigationView="none"
                selectedTabId="1"
                setSelectedNavigationView={vi.fn()}
              />
            </AccessibilityProvider>
          </TableDataProvider>
        </VariablesProvider>
      </AppProvider>
    );

    const { rerender } = render(view);

    await waitFor(() => {
      expect(TablesService.getDefaultSelection).toHaveBeenCalledTimes(1);
    });

    mockResolvedLanguage = 'sv';

    rerender(view);

    await waitFor(() => {
      expect(TablesService.getDefaultSelection).toHaveBeenCalledTimes(2);
    });
  });

  it('keeps current selection when language changes in keep mode', async () => {
    mockedConfig.tableViewer = { selectionOnLanguageChange: 'keep' };

    const view = (
      <AppProvider>
        <VariablesProvider>
          <TableDataProvider>
            <AccessibilityProvider>
              <Selection
                openedWithKeyboard={false}
                selectedNavigationView="none"
                selectedTabId="1"
                setSelectedNavigationView={vi.fn()}
              />
            </AccessibilityProvider>
          </TableDataProvider>
        </VariablesProvider>
      </AppProvider>
    );

    const { rerender } = render(view);

    await waitFor(() => {
      expect(TablesService.getDefaultSelection).toHaveBeenCalledTimes(1);
    });

    mockResolvedLanguage = 'sv';

    rerender(view);

    await waitFor(() => {
      expect(TablesService.getMetadataById).toHaveBeenCalled();
    });

    expect(TablesService.getDefaultSelection).toHaveBeenCalledTimes(1);
  });
});
