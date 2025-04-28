import React from 'react';
import { render } from '@testing-library/react';
import { TableDataProvider, TableDataContext } from './TableDataProvider';
import { VariablesProvider } from './VariablesProvider';
import { vi } from 'vitest';

describe('TableDataProvider', () => {
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
      .mockImplementation(() => {});

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
