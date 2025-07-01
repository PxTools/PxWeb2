import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

import { SearchSelect, type Option } from './SearchSelect';

describe('SearchableSelect', () => {
  const mockOptions: Option[] = [
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

  it('should select highlighted option with Enter', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.click(input);
    await user.keyboard('[ArrowDown][Enter]');
    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[0]);
  });

  it('should close list on Escape key', async () => {
    const user = userEvent.setup();
    const { getByRole, queryByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.click(input);
    await user.keyboard('[Escape]');
    expect(queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup();
    const { getByRole, getByLabelText } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.type(input, 'Option');
    expect(getByLabelText('Clear selection')).toBeInTheDocument();
  });

  it('should clear selection when clear button is clicked', async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(
      <SearchSelect
        options={mockOptions}
        onSelect={mockOnSelect}
        selectedOption={mockOptions[1]}
      />,
    );
    const clearBtn = getByLabelText('Clear selection');
    await user.click(clearBtn);
    expect(mockOnSelect).toHaveBeenCalledWith(undefined);
  });

  it('should clear input on blur when value has no match', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.type(input, 'invalid');
    await user.tab(); // blur input
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('should select exact match with Enter if typed manually', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Option 2');
    await user.keyboard('[Enter]');
    expect(mockOnSelect).toHaveBeenCalledWith(mockOptions[1]);
  });

  it('should show noOptionsText when there are no matches', async () => {
    const user = userEvent.setup();
    const { getByRole, findByText } = render(
      <SearchSelect
        options={[{ label: 'Banana', value: 'b' }]}
        onSelect={mockOnSelect}
        noOptionsText="No results"
      />,
    );
    const input = getByRole('combobox');
    await user.click(input);
    await user.type(input, 'xyz');
    expect(await findByText('No results')).toBeInTheDocument();
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

  it('should set aria-activedescendant on input when navigating', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(
      <SearchSelect options={mockOptions} onSelect={mockOnSelect} />,
    );
    const input = getByRole('combobox');
    await user.click(input);
    await user.keyboard('[ArrowDown]');
    expect(input).toHaveAttribute(
      'aria-activedescendant',
      'searchable-select-option-0',
    );
  });
});
