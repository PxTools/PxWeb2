import { render } from '@testing-library/react';

import TableCard from './TableCard';

describe('TableCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <TableCard
        href="/"
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
