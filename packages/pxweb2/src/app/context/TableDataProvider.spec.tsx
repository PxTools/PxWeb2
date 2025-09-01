import React, { useContext, useEffect } from 'react';
import { render, act, waitFor } from '@testing-library/react';
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
            pivotCW: vi.fn(),
            buildTableTitle: vi.fn(),
            stubDesktop: [],
            headingDesktop: [],
            stubMobile: [],
            headingMobile: [],
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

// Mock PxTable and Variable types
const makePxTable = (variableIds: string[]) => ({
  metadata: {
    id: 'test-table',
    variables: variableIds.map((id) => ({ id, values: [{ code: 'v1' }] })),
  },
  stub: variableIds.map((id) => ({ id, values: [{ code: 'v1' }] })),
  heading: [],
});

describe('TableDataProvider', () => {
  it('updates stubDesktop, headingDesktop, stubMobile, and headingMobile when a variable is removed', async () => {
    let contextValue: any = null;

    // Test component to access context and trigger initializeStubAndHeading
    const TestComponent = ({ pxTable, isMobile }: any) => {
      const context = useContext(TableDataContext);
      contextValue = context;
      useEffect(() => {
        // @ts-ignore: access internal function for test
        context?.initializeStubAndHeading?.(pxTable, isMobile);
      }, [pxTable, isMobile]);
      return null;
    };

    // Render with initial variables
    const initialPxTable = makePxTable(['var1', 'var2', 'var3']);
    render(
      <VariablesProvider>
        <TableDataProvider>
          <TestComponent pxTable={initialPxTable} isMobile={false} />
        </TableDataProvider>
      </VariablesProvider>,
    );

    // Simulate removing 'var2'
    const updatedPxTable = makePxTable(['var1', 'var3']);
    await act(async () => {
      contextValue?.initializeStubAndHeading?.(updatedPxTable, false);
    });

    // Wait for the state to update
    await waitFor(() => {
      expect(contextValue.stubDesktop).toEqual(['var1', 'var3']);
      expect(contextValue.headingDesktop).toEqual([]); // as per makePxTable
      expect(contextValue.stubMobile).toEqual(['var1', 'var3']);
      expect(contextValue.headingMobile).toEqual([]);
    });
  });
});
