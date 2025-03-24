import { render } from '@testing-library/react';

import TableCard from './TableCard';

describe('TableCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<TableCard tableId="12" />);
    expect(baseElement).toBeTruthy();
  });
});
