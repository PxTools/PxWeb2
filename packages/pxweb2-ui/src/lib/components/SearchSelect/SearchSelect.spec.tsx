import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { SearchSelect, type SelectOption } from './SearchSelect';

describe('SearchableSelect', () => {
  const mockOptions: SelectOption[] = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  const mockOnSelect = vi.fn();
  it('should render successfully', () => {
    const { baseElement } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should show all options when input is clicked', async () => {
    const user = userEvent.setup();
    const { getByRole, findAllByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.click(input);
    const options = await findAllByRole('option');
    expect(options).toHaveLength(mockOptions.length);
  });

  it('should set inputMode and pattern when inputMode="numeric"', () => {
    const { getByRole } = render(
      <SearchSelect
        options={mockOptions}
        onSelect={mockOnSelect}
        inputMode="numeric"
      />,
    );
    const input = getByRole('combobox');

    expect(input).toHaveAttribute('inputmode', 'numeric');
    expect(input).toHaveAttribute('pattern', '[0-9]*');
  });

  it('should not set inputMode or pattern by default', () => {
    const { getByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');

    expect(input).not.toHaveAttribute('inputmode');
    expect(input).not.toHaveAttribute('pattern');
  });
});
