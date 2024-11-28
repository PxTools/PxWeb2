import { render } from '@testing-library/react';

import { Heading } from './Heading';

describe('Heading', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Heading>test</Heading>);
    expect(baseElement).toBeTruthy();
  });
});
