import { render } from '@testing-library/react';

import ContentTop from './ContentTop';

describe('ContentTop', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ContentTop />);
    expect(baseElement).toBeTruthy();
  });
});
