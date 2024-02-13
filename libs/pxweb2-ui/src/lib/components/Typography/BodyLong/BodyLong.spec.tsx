import { render } from '@testing-library/react';

import BodyLong from './BodyLong';

describe('BodyLong', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BodyLong />);
    expect(baseElement).toBeTruthy();
  });
});
