import type { Meta, StoryFn } from '@storybook/react';
import { Select, SelectOption } from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Components/Select',
};
export default meta;

const options: SelectOption[] = [{ label: 'Option 1', value: 'opt1' }, { label: 'Option 2', value: 'opt2'}, { label: 'Option 3 is an option with a very long text', value: 'opt3'}];
const placeholder = 'Make selection';

function selectedOptionChanged(selectedItem: SelectOption | undefined) {  
  selectedItem ? console.log('Selected option: ' + selectedItem.label) : console.log('No option selected');
}

export const Default = {
  args: {
    variant: 'default',
    label: 'Select classification',
    modalHeading: 'Variable name',
    hideLabel: false,
    options: options,
    placeholder: placeholder,
    onChange: selectedOptionChanged,
  },
};

export const Variant: StoryFn<typeof Select> = () => {
  return (
    <>
      <h1>Variant</h1>

      <h2>Default:</h2>
      <Select label="Label" options={options} placeholder={placeholder} onChange={selectedOptionChanged}></Select>

      <h2>inVariableBox:</h2>
      <Select label="Label" variant='inVariableBox' options={options} placeholder={placeholder} onChange={selectedOptionChanged}></Select>
    </>
  );
};

export const ShowLabel: StoryFn<typeof Select> = () => {
  return (
    <>
      <h1>Hide Label</h1>

      <h2>With label:</h2>
      <Select label="Label" options={options} placeholder={placeholder} onChange={selectedOptionChanged}></Select>

      <h2>Without label:</h2>
      <Select label="Label" hideLabel options={options} placeholder={placeholder} onChange={selectedOptionChanged}></Select>
    </>
  );
};

export const SelectedOption: StoryFn<typeof Select> = () => {
  return (
    <>
      <h1>Selected option</h1>

      <h2>Selected option = Option 2:</h2>
      <Select label="Label" options={options} placeholder={placeholder} selectedOption={options[1]} onChange={selectedOptionChanged}></Select>

      <h2>No selected option:</h2>
      <Select label="Label" hideLabel options={options} placeholder={placeholder} onChange={selectedOptionChanged}></Select>
    </>
  );
};