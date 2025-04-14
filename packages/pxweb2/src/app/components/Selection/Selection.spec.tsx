import { renderWithProviders } from '../../util/testing-utils';
import Selection from './Selection';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import React from 'react';
import { render } from '@testing-library/react';
import { TableDataProvider, TableDataContext } from '../../context/TableDataProvider' ;
import { VariablesProvider } from '../../context/VariablesProvider';
import { vi } from 'vitest';

test('should throw an error when triggered', () => {
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
  { }

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
  }
  ).toThrow('Simulated error');
  consoleErrorSpy.mockRestore();
} );



describe('Selection', () => {
  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <AccessibilityProvider>
        <Selection
          openedWithKeyboard={false}
          selectedNavigationView=""
          selectedTabId="1"
          setSelectedNavigationView={() => {}}
        />
      </AccessibilityProvider>,
    );

    expect(baseElement).toBeTruthy();
  });
});

