import { render } from '@testing-library/react';

import Selection from './Selection';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';

describe('Selection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <AccessibilityProvider>
        <Selection />
      </AccessibilityProvider>,
    );
    expect(baseElement).toBeTruthy();
  });
});
