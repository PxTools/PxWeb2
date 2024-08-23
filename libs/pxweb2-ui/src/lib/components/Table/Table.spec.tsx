import { render } from '@testing-library/react';

import Table from './Table';
import { pxTable } from './testData';

describe('Table', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Table pxtable={pxTable} />);
    expect(baseElement).toBeTruthy();
  });
});
