import React from 'react';
import { render } from '@testing-library/react';

import { VariablesProvider } from '../context/VariablesProvider';
import { TableDataProvider } from '../context/TableDataProvider';
import { AppProvider } from '../context/AppProvider';
import { ChartRefProvider } from '../context/ChartRefProvider';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <AppProvider>
      <VariablesProvider>
        <TableDataProvider>
          <ChartRefProvider>{ui}</ChartRefProvider>
        </TableDataProvider>
      </VariablesProvider>
    </AppProvider>,
  );
};

export { renderWithProviders };
