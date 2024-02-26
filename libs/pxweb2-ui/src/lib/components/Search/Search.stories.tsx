import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Search } from './Search';

const meta: Meta<typeof Search> = {
  component: Search,
  title: 'Components/Search',
};

export default meta;

const text =  'Sök';

type Story = StoryObj<typeof Search>;

export const Default: Story = {
  args: {
    variant: 'default',
    lable: false,
    lableText: 'Sök',
    
//     size: 'medium',
//     spacing: false,
//     align: 'start',
//     weight: 'regular',
//     textcolor: 'default',
//   },
//   argTypes: {
//     size: {
//       options: ['medium', 'small'],
//       control: { type: 'radio' },
//     },
  },
};



export const Variants: StoryFn<typeof Search> = () => {
    return (
      <>
        Primary with icon only medium
        <br />
        <Search
          variant="default"
          icon="Pencil"
          
          //aria-label={'Button with icon'}
        >

        </Search>
        <br />
        </>
  );
};    
