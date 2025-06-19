import { render } from '@testing-library/react';

import { SearchableSelect, type SelectOption } from './SearchableSelect';

describe('SearchableSelect', () => {
  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  const mockOnSelect = vi.fn();
  it('should render successfully', () => {
    const { baseElement } = render(
      <SearchableSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
