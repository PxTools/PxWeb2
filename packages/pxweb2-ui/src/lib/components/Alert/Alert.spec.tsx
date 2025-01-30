import { render } from '@testing-library/react';

import Alert from './Alert';

describe('Alert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Alert variant="info" />);
    expect(baseElement).toBeTruthy();
  });
});
