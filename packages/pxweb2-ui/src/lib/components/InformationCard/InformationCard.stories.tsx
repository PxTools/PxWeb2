import type { Meta, StoryObj } from '@storybook/react';

import { InformationCard, InformationCardProps } from './InformationCard';

const meta: Meta<typeof InformationCard> = {
  component: InformationCard,
  title: 'Components/InformationCard',
};
export default meta;

type Story = StoryObj<typeof InformationCard>;

export const Default: Story = {
  args: {
    heading: 'Information Card',
    headingSize: 'large',
    headingLevel: '2',
    icon: 'Book',
    children: 'This is an information card.',
  },
  render: (args) => <InformationCard {...args} />,
}


export const WithoutHeading: Story = {
  args: {
    heading: '',
    headingSize: 'large',
    headingLevel: '2',
    icon: 'Book',
    children: 'This is an information card.',
  },
  render: (args) => <InformationCard {...args} />,
}

// export const Default: Story = {
//   args: {
//     variant: 'default',
//     name: 'informationCard1',
//     options: [{ label: 'Label', value: 'opt1' }],
//   },
// };



// export  con default {
//   title: 'Components/InformationCard',
//   component: InformationCard,
//   argTypes: {
//     children: {
//       control: {
//         type: 'text',
//       },
//     },
//   },
// }


// type Story = StoryObj<InformationCardProps>;
// export const Default: Story = {
//   args: {
//     heading: 'Information Card',
//     headingSize: 'large',
//     headingLevel: '2',
//     icon: 'Book',
//     children: 'This is an information card.',
//   },
//   render: (args) => <InformationCard {...args} />,
// }
