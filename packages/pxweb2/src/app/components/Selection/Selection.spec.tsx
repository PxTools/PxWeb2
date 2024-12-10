import { render } from '@testing-library/react';

import Selection from './Selection';

describe('Selection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Selection />);
    expect(baseElement).toBeTruthy();
  });
});
