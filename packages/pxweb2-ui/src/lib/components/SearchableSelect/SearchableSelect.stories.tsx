import type { Meta, StoryFn } from '@storybook/react';
import { SearchableSelect, type SelectOption } from './SearchableSelect';

const meta: Meta<typeof SearchableSelect> = {
  component: SearchableSelect,
  title: 'Components/SearchableSelect',
};
export default meta;

const generateYearOptions = (start: number, end: number): SelectOption[] =>
  Array.from({ length: end - start + 1 }, (_, i) => {
    const year = (start + i).toString();
    return { label: year, value: year };
  });

const options = generateYearOptions(1980, 2025);
const placeholder = 'Chooose year';

function selectedOptionChanged(selectedItem: SelectOption | undefined) {
  selectedItem
    ? console.log('Selected option: ' + selectedItem.label)
    : console.log('No option selected');
}

export const Default = {
  args: {
    label: 'Year',
    options: options,
    placeholder: placeholder,
    onSelect: selectedOptionChanged,
  },
};

export const SelectedOption: StoryFn<typeof SearchableSelect> = () => {
  return (
    <>
      <h1>Selected option</h1>

      <h2>Selected option = Option 2:</h2>
      <SearchableSelect
        label="Year"
        options={options}
        placeholder={placeholder}
        selectedOption={options[1]}
        onSelect={selectedOptionChanged}
      ></SearchableSelect>
    </>
  );
};
