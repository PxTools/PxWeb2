import { render } from '@testing-library/react';

import { ActionItemIcon } from './ActionItemIcon';

describe('ActionItemIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ActionItemIcon largeIconName="Table" />);
    expect(baseElement).toBeTruthy();
  });
  it('should return null if icon does not exist', () => {
    // @ts-expect-error: purposely passing invalid icon name
    const { container } = render(<ActionItemIcon largeIconName="NonExistentIcon" />);
    expect(container.firstChild).toBeNull();
  });
});
