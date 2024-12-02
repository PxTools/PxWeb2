import { render } from '@testing-library/react';

import BodyShort from './BodyShort';

describe('BodyShort', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BodyShort />);
    expect(baseElement).toBeTruthy();
  });
});
