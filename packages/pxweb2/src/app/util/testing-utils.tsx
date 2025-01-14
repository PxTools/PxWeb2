import React from 'react';

import { render } from '@testing-library/react';
import { VariablesProvider } from '../context/VariablesProvider';
import { TableDataProvider } from '../context/TableDataProvider';

const renderWithProviders = (ui: React.ReactNode) => {
  return render(
    <VariablesProvider>
      <TableDataProvider>{ui}</TableDataProvider>
    </VariablesProvider>,
  );
};

export { renderWithProviders };
