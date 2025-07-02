import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { DrawerSave } from './DrawerSave';
import { renderWithProviders } from '../../../util/testing-utils';

describe('DrawerSave', () => {
  it('renders successfully', () => {
    const element = renderWithProviders(<DrawerSave tableId="test" />);

    expect(element).toBeTruthy();
  });
});
