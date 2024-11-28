import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Search } from './Search';

const meta: Meta<typeof Search> = {
  component: Search,
  title: 'Components/Search',
};

export default meta;

const placeholder = 'Text';
const labelText = 'This is a label';

type Story = StoryObj<typeof Search>;

export const Default: Story = {
  args: {
    variant: 'default'    
  },
};

export const Variants: StoryFn<typeof Search> = () => {
  return (
    <>
      Default
      <br />
      <br />
      <Search
        variant="default"
        searchPlaceHolder={placeholder}          
      >
      </Search>
      <br />
      In a variable box
      <br />
      <br />
      <Search
        variant="inVariableBox"
        searchPlaceHolder={placeholder}          
      >
      </Search>
      <br />
      Default with label 
      <br />
      <br />
      <Search
        showLabel={true}
        variant="default"
        searchPlaceHolder={placeholder}          
        labelText={labelText}          
      >
      </Search>
      <br />        
      Default without label 
      <br />
      <br />
      <Search
        variant="default"
        searchPlaceHolder={placeholder}          
      >
      </Search>
      <br />        
      In variable box  
      <br />
      <br />
      <Search
        variant="inVariableBox"
        searchPlaceHolder={placeholder}          
      >
      </Search>
      <br />       
    </>
  );
}; 