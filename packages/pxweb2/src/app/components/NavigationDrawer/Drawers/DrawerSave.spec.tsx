import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { DrawerSave } from './DrawerSave';

describe('DrawerSave', () => {
  it('renders successfully', () => {
    const element = render(<DrawerSave />);

    expect(element).toBeTruthy();
  });

  it('has correct display name', () => {
    expect(DrawerSave.displayName).toBe('DrawerSave');
  });
});
