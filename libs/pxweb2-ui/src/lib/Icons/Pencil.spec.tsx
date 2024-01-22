import { render } from '@testing-library/react';

import Pencil from './Pencil';

describe('Pencil', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Pencil />);
    expect(baseElement).toBeTruthy();
  });
});
