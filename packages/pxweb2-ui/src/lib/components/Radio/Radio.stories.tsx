import type { Meta, StoryFn, StoryObj } from '@storybook/react';
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
      options: [
        { label: 'Label', value: 'opt1' }        
      ],
  },
};

export const inModal: StoryFn<typeof Radio> = () => {
  return (
    <Radio
      name='radio1'
      options={[
        { label: 'Label', value: 'opt1' }        
      ]}
      variant='inModal'
      onChange={undefined}
    ></Radio>    
  );
};

export const DefaultGroup: StoryFn<typeof Radio> = () => {
  return (
    <>
      <Radio
        name='radio2'        
        options={[
          { label: 'First option', value: 'option1' }        
        ]}
        onChange={undefined}
        selectedOption='option1'>                   
      </Radio>    
      <Radio
        name='radio2'
        options={[
          { label: 'Second option', value: 'option2' }        
        ]}
        onChange={undefined}
        selectedOption='option2'>          
      </Radio>
      <Radio
        name='radio2'
        options={[
          { label: 'Third option that has a long text to show what happens in the radio component whith this options and the others options when a text are stretched over several lines ', value: 'option3' }        
        ]}
        onChange={undefined}
        selectedOption='option3'>          
      </Radio>
      <Radio
        name='radio2'
        options={[
          { label: 'Fourth option', value: 'option4' }        
        ]}
        onChange={undefined}
        selectedOption='option4'>          
      </Radio>    
      </>
  );}


  export const InModalGroup: StoryFn<typeof Radio> = () => {
    return (
      <>
        <Radio
          name='radio2'        
          options={[
            { label: 'First option', value: 'option1' }        
          ]}
          onChange={undefined}
          selectedOption='option1'
          variant='inModal'>                   
        </Radio>    
        <Radio
          name='radio2'
          options={[
            { label: 'Second option', value: 'option2' }        
          ]}
          onChange={undefined}
          selectedOption='option2'
          variant='inModal'>          
        </Radio>
        <Radio
          name='radio2'
          options={[
            { label: 'Third option that has a long text to show what happens in the radio component whith this options and the others options when a text are stretched over several lines ', value: 'option3' }        
          ]}
          onChange={undefined}
          selectedOption='option3'
          variant='inModal'>          
        </Radio>
        <Radio
          name='radio2'
          options={[
            { label: 'Fourth option', value: 'option4' }        
          ]}
          onChange={undefined}
          selectedOption='option4'
          variant='inModal'>          
        </Radio>    
        </>
    );}
  