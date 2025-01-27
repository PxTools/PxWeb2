import React from 'react';

import { render } from '@testing-library/react';
import { VariablesProvider } from '../context/VariablesProvider';
import { TableDataProvider } from '../context/TableDataProvider';
import { AppProvider } from '../context/AppProvider';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <AppProvider>
      <VariablesProvider>
        <TableDataProvider>{ui}</TableDataProvider>
      </VariablesProvider>
    </AppProvider>,
  );
};

export { renderWithProviders };
