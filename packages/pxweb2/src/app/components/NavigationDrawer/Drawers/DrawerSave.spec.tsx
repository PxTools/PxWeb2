import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../../util/testing-utils';
import '@testing-library/jest-dom/vitest';

import { DrawerSave } from './DrawerSave';

describe('DrawerSave', () => {
  it('renders successfully', () => {
    const element = renderWithProviders(<DrawerSave tableId="test" />);

    expect(element).toBeTruthy();
  });
});
