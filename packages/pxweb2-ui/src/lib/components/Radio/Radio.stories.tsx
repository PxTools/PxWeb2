import type { Meta, StoryFn, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  component: Radio,
  title: 'Components/Radio',
};
export default meta;

type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {
    variant: 'default',
    name: 'radio1',
    legend: 'Radio legend',
    options: [{ label: 'Label', value: 'opt1' }],
  },
};

export const InModal: StoryFn<typeof Radio> = () => {
  return (
    <Radio
      name="radio1"
      options={[{ label: 'Label', value: 'opt1' }]}
      inModal={true}
      legend="Radio legend"
      onChange={undefined}
    ></Radio>
  );
};

export const DefaultGroup: StoryFn<typeof Radio> = () => {
  return (
    <>
      <Radio
        name="radio2"
        options={[{ label: 'First option', value: 'option1' }]}
        onChange={undefined}
        selectedOption="option1"
        legend="Radio legend"
      ></Radio>
      <Radio
        name="radio2"
        options={[{ label: 'Second option', value: 'option2' }]}
        onChange={undefined}
        selectedOption="option2"
        legend="Radio legend"
      ></Radio>
      <Radio
        name="radio2"
        options={[
          {
            label:
              'Third option that has a long text to show what happens in the radio component whith this options and the others options when a text are stretched over several lines ',
            value: 'option3',
          },
        ]}
        onChange={undefined}
        selectedOption="option3"
        legend="Radio legend"
      ></Radio>
      <Radio
        name="radio2"
        options={[{ label: 'Fourth option', value: 'option4' }]}
        onChange={undefined}
        selectedOption="option4"
        legend="Radio legend"
      ></Radio>
    </>
  );
};

export const InModalGroup: StoryFn<typeof Radio> = () => {
  return (
    <>
      <Radio
        name="radio2"
        options={[{ label: 'First option', value: 'option1' }]}
        onChange={undefined}
        selectedOption="option1"
        inModal={true}
        legend="Radio legend"
      ></Radio>
      <Radio
        name="radio2"
        options={[{ label: 'Second option', value: 'option2' }]}
        onChange={undefined}
        selectedOption="option2"
        inModal={true}
        legend="Radio legend"
      ></Radio>
      <Radio
        name="radio2"
        options={[
          {
            label:
              'Third option that has a long text to show what happens in the radio component whith this options and the others options when a text are stretched over several lines ',
            value: 'option3',
          },
        ]}
        onChange={undefined}
        selectedOption="option3"
        inModal={true}
        legend="Radio legend"
      ></Radio>
      <Radio
        name="radio2"
        options={[{ label: 'Fourth option', value: 'option4' }]}
        onChange={undefined}
        selectedOption="option4"
        inModal={true}
        legend="Radio legend"
      ></Radio>
    </>
  );
};

export const DefaultVisibleLegend: StoryFn<typeof Radio> = () => {
  const testData = [
    { label: 'First option', value: 'option1' },
    { label: 'Second option', value: 'option2' },
    {
      label:
        'Third option that has a long text to show what happens in the radio component whith this options and the others options when a text are stretched over several lines ',
      value: 'option3',
    },
    { label: 'Fourth option', value: 'option4' },
  ];
  return (
    <Radio
      name="radio2"
      options={testData}
      onChange={undefined}
      selectedOption="option1"
      legend="Legend"
      hideLegend={false}
    ></Radio>
  );
};

export const ModalVisibleLegend: StoryFn<typeof Radio> = () => {
  const testData = [
    { label: 'First option', value: 'option1' },
    { label: 'Second option', value: 'option2' },
    {
      label:
        'Third option that has a long text to show what happens in the radio component whith this options and the others options when a text are stretched over several lines ',
      value: 'option3',
    },
    { label: 'Fourth option', value: 'option4' },
  ];
  return (
    <Radio
      name="radio2"
      options={testData}
      onChange={undefined}
      selectedOption="option1"
      inModal={true}
      legend="Legend"
      hideLegend={false}
    ></Radio>
  );
};

export const CheckCircle: StoryFn<typeof Radio> = () => {
  type RadioOptions = 'option1' | 'option2' | 'option3';

  const [selectedRadio, setSelectedRadio] = useState<RadioOptions>('option1');

  function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedRadio(event.target.value as RadioOptions);
  }

  return (
    <Radio
      name="checkCircleRadio"
      legend="Check Circle, choose an option"
      variant="checkCircle"
      options={[
        { label: 'First option', value: 'option1' },
        { label: 'Second option', value: 'option2' },
        { label: 'Third option', value: 'option3' },
      ]}
      selectedOption={selectedRadio}
      onChange={handleRadioChange}
    />
  );
};
