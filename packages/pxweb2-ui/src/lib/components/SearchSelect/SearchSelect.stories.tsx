import type { Meta, StoryFn, StoryObj } from '@storybook/react-vite';
import { SearchSelect, type Option } from './SearchSelect';

const meta: Meta<typeof SearchSelect> = {
  component: SearchSelect,
  title: 'Components/SearchSelect',
  argTypes: {
    options: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SearchSelect>;

const generateYearOptions = (start: number, end: number): Option[] =>
  Array.from({ length: end - start + 1 }, (_, i) => {
    const year = (start + i).toString();
    return { label: year, value: year };
  });

const options = generateYearOptions(1980, 2025);

function selectedOptionChanged(selectedItem: Option | undefined) {
  selectedItem
    ? console.log('Selected option: ' + selectedItem.label)
    : console.log('No option selected');
}

export const Default: Story = {
  render: (args) => <SearchSelect {...args} options={options} />,
  args: {
    label: 'Year',
    id: 'search-select',
    options: options,
    onSelect: selectedOptionChanged,
    inputMode: 'numeric',
    clearSelectionText: 'Clear selection',
  },
};

export const SelectedOption: StoryFn<typeof SearchSelect> = () => {
  return (
    <SearchSelect
      label="Year"
      options={options}
      selectedOption={options[1]}
      onSelect={selectedOptionChanged}
      inputMode="numeric"
      clearSelectionText="Clear selection"
    ></SearchSelect>
  );
};
