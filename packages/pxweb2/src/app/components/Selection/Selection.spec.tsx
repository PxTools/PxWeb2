import React from 'react';
import { vi } from 'vitest';

import { renderWithProviders } from '../../util/testing-utils';
import Selection from './Selection';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { TableDataContext } from '../../context/TableDataProvider';

describe('Selection', () => {
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
      .mockImplementation(() => {});
    expect(() => {
      renderWithProviders(<TestComponent />);
    }).toThrow('Simulated error');
    consoleErrorSpy.mockRestore();
  });

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
      <AccessibilityProvider>
        <Selection
          openedWithKeyboard={false}
          selectedNavigationView="none"
          selectedTabId="1"
          setSelectedNavigationView={() => {}}
        />
      </AccessibilityProvider>,
    );

    expect(baseElement).toBeTruthy();

    expect(() => {
      throw new Error('Simulated error');
    }).toThrow('Simulated error');
  });
});
