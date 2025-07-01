import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { DrawerHelp } from './DrawerHelp';

describe('DrawerHelp', () => {
  it('renders successfully', () => {
    const element = render(<DrawerHelp />);

    expect(element).toBeTruthy();
  });

  it('has correct display name', () => {
    expect(DrawerHelp.displayName).toBe('DrawerHelp');
  });
});
