import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Search } from './Search';


const meta: Meta<typeof Search> = {
  component: Search,
  title: 'Components/Search',
};

export default meta;

const placeholder = 'Text';
const lableText = 'This is a lable';


type Story = StoryObj<typeof Search>;

export const Default: Story = {
  args: {
    variant: 'default',
    lable: false,    
  },
};



export const Variants: StoryFn<typeof Search> = () => {
    return (
      <>
        Default
        <br />
        <Search
          variant="default"
          placeholder={placeholder}          
        >
        </Search>
        <br />
        In a variable box
        <br />
        <Search
          variant="inVariableBox"
          placeholder={placeholder}          
        >
        </Search>
        <br />
        Default with lable 
        <br />
        <Search
          variant="default"
          placeholder={placeholder}            
          lableText= {lableText}
          lable={true}         
        >
        </Search>
        <br />        
        Default without lable 
        <br />
        <Search
          variant="default"
          placeholder={placeholder}            
          lableText={lableText}
          lable={false}         
        >
        </Search>
        <br />        

        </>
  );


  
};    


