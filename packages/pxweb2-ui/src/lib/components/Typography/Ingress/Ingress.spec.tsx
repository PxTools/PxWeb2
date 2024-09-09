import { render } from '@testing-library/react';

import Ingress from './Ingress';

describe('Ingress', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Ingress />);
    expect(baseElement).toBeTruthy();
  });
});
