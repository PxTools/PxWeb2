import { render } from '@testing-library/react';

import Presentation from './Presentation';

describe('Presentation', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Presentation />);
    expect(baseElement).toBeTruthy();
  });
});
