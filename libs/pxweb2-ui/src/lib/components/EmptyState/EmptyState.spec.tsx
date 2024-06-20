import { render } from '@testing-library/react';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <EmptyState headingTxt="test">'test'</EmptyState>
    );
    
    expect(baseElement).toBeTruthy();
  });
});
