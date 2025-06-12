import { render } from '@testing-library/react';

import { ActionItemIcon } from './ActionItemIcon';

describe('ActionItemIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionItemIcon largeIconName="Table" />);
    expect(baseElement).toBeTruthy();
  });
});
