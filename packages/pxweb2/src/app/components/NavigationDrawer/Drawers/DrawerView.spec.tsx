import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { DrawerView } from './DrawerView';

describe('DrawerView', () => {
  it('renders successfully', () => {
    const element = render(<DrawerView />);

    expect(element).toBeTruthy();
  });

  it('has correct display name', () => {
    expect(DrawerView.displayName).toBe('DrawerView');
  });
});
