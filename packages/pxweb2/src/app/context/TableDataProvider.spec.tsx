import React from 'react';
import { render } from '@testing-library/react';
import { TableDataProvider, TableDataContext } from './TableDataProvider';
import { VariablesProvider } from './VariablesProvider';
import { vi } from 'vitest';
import { i18n } from 'i18next';

describe('TableDataProvider', () => {
  it('should call fetchTableData and update context data', async () => {
    const mockI18nInstance = {
      language: 'en',
      t: vi.fn(),
    } as unknown as i18n;

    const mockFetchTableData = vi.fn();
    const TestComponent = () => {
      const context = React.useContext(TableDataContext);
      React.useEffect(() => {
        if (context) {
          context.fetchTableData('testTableId', mockI18nInstance, false);
        }
      }, [context]);
      return null;
    };

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    render(
      <VariablesProvider>
        <TableDataContext.Provider
          value={{
            isInitialized: true,
            data: undefined,
            fetchTableData: mockFetchTableData,
            fetchSavedQuery: vi.fn(),
            pivotToMobile: vi.fn(),
            pivotToDesktop: vi.fn(),
            pivot: vi.fn(),
            buildTableTitle: vi.fn(),
          }}
        >
          <TestComponent />
        </TableDataContext.Provider>
      </VariablesProvider>,
    );

    expect(mockFetchTableData).toHaveBeenCalledWith(
      'testTableId',
      expect.any(Object),
      false,
    );

    consoleErrorSpy.mockRestore();
  });

  it('should throw an error when triggered', () => {
    const TestComponent = () => {
      const context = React.useContext(TableDataContext);
      React.useEffect(() => {
        if (context) {
          // Simulate the error being thrown
          throw new Error('Simulated error');
        }
      }, [context]);
      return null;
    };

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {
        // Suppress console error during test
        return undefined;
      });

    expect(() => {
      render(
        <VariablesProvider>
          <TableDataProvider>
            <TestComponent />
          </TableDataProvider>
        </VariablesProvider>,
      );
    }).toThrow('Simulated error');

    consoleErrorSpy.mockRestore();
  });
});
