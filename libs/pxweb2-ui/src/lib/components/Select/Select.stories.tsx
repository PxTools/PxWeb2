import type { Meta, StoryFn } from '@storybook/react';
import { Select, SelectOption } from './Select';

const meta: Meta<typeof Select> = {
  component: Select,
  title: 'Components/Select',
};
export default meta;

const options: SelectOption[] = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2'}, { label: 'Option 3', value: '3'}];
const defaultOption = 'Make selection';

function selectedOptionChanged(selectedItem: SelectOption) {  
  console.log('Selected option: ' + selectedItem.label);
}

export const Default = {
  args: {
    variant: 'default',
    label: 'Label',
    hideLabel: false,
    options: options,
    defaultOption: defaultOption,
    onChange: selectedOptionChanged,
  },
};

export const Variant: StoryFn<typeof Select> = () => {
  return (
    <>
      <h1>Variant</h1>

      <h2>Default:</h2>
      <Select label="Label" options={options} defaultOption={defaultOption} onChange={selectedOptionChanged}></Select>

      <h2>inVariableBox:</h2>
      <Select label="Label" variant='inVariableBox' options={options} defaultOption={defaultOption} onChange={selectedOptionChanged}></Select>
    </>
  );
};

export const ShowLabel: StoryFn<typeof Select> = () => {
  return (
    <>
      <h1>Hide Label</h1>

      <h2>With label:</h2>
      <Select label="Label" options={options} defaultOption={defaultOption} onChange={selectedOptionChanged}></Select>

      <h2>Without label:</h2>
      <Select label="Label" hideLabel options={options} defaultOption={defaultOption} onChange={selectedOptionChanged}></Select>
    </>
  );
};

export const SelectedOption: StoryFn<typeof Select> = () => {
  return (
    <>
      <h1>Selected option</h1>

      <h2>Selected option = 1:</h2>
      <Select label="Label" options={options} defaultOption={defaultOption} selectedOption='1' onChange={selectedOptionChanged}></Select>

      <h2>No selected option:</h2>
      <Select label="Label" hideLabel options={options} defaultOption={defaultOption} onChange={selectedOptionChanged}></Select>
    </>
  );
};