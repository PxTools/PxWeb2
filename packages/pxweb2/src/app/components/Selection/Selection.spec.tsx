import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

import {
  mockTableService,
  renderWithProviders,
} from '../../util/testing-utils';
import Selection, { getCodeListTEST } from './Selection';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import {
  TableDataProvider,
  TableDataContext,
} from '../../context/TableDataProvider';
import { VariablesProvider } from '../../context/VariablesProvider';

// Mock API-responses from the table service
mockTableService();

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
    {
    }

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

    expect(() => {
      throw new Error('Simulated error');
    }).toThrow('Simulated error');
  });

  it('should fetch and return a valid CodeList from the API', async () => {
    const codelist = await getCodeListTEST('vs_RegionLän07', 'en', 'value');
    expect(codelist.id).toBe('vs_RegionLän07');
    expect(codelist.mandatory).toBe(true);
    expect(codelist.values).toBeDefined();
    expect(codelist.values.length).toBeGreaterThan(0);
    expect(codelist.values[0].code).toBe('01');
    expect(codelist.values[0].label).toBe('Stockholm county');
  });
});
