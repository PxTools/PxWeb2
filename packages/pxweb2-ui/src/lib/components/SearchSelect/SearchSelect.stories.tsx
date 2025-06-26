import type { Meta, StoryFn, StoryObj } from '@storybook/react-vite';
import { SearchSelect, type SelectOption } from './SearchSelect';

const meta: Meta<typeof SearchSelect> = {
  component: SearchSelect,
  title: 'Components/SearchSelect',
  argTypes: {
    options: { control: false },
  },
};
export default meta;

type Story = StoryObj<typeof SearchSelect>;

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

export const Default: Story = {
  render: (args) => <SearchSelect {...args} options={options} />,
  args: {
    label: 'Year',
    options: options,
    placeholder: placeholder,
    onSelect: selectedOptionChanged,
  },
};

export const SelectedOption: StoryFn<typeof SearchSelect> = () => {
  return (
    <SearchSelect
      label="Year"
      options={options}
      placeholder={placeholder}
      //selectedOption={options[1]}
      onSelect={selectedOptionChanged}
      inputMode="numeric"
    ></SearchSelect>
  );
};
