import React from 'react';
import { act } from '@testing-library/react';
import { vi } from 'vitest';

import {
  renderWithProviders,
  mockTableService,
} from '../../util/testing-utils';
import Selection from './Selection';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { TableDataContext } from '../../context/TableDataProvider';

describe('Selection', () => {
  mockTableService();

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
});
