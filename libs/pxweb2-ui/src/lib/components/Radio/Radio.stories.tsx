import type { Meta, StoryFn } from '@storybook/react';
import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  component: Radio,
  title: 'Components/Radio',
};
export default meta;

export const Default: StoryFn<typeof Radio> = () => {
  return (
    <Radio
      name='radio1'
      options={[
        { label: 'Label', value: 'opt1' }        
      ]}
      onChange={undefined}
    ></Radio>    
  );
};

export const Variants: StoryFn<typeof Radio> = () => {
  return (
    <>
      <Radio
        name='radio2'        
        options={[
          { label: 'Pest', value: 'option1' }        
        ]}
        onChange={undefined}
        selectedOption='option1'>                   
      </Radio>    
      <Radio
        name='radio2'
        options={[
          { label: 'Kolera', value: 'option2' }        
        ]}
        onChange={undefined}
        selectedOption='option2'>          
      </Radio>    
      </>
  );}