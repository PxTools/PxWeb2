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
    headingText: 'Information card with header',
    icon: 'Book',
    children: 'This is an information card with heading.',
  },
  render: (args: InformationCardProps) => <InformationCard {...args} />,
};

export const WithoutHeading: Story = {
  args: {
    icon: 'Book',
    children: 'This is an information card without heading.',
  },
  render: (args) => <InformationCard {...args} />,
};

export const WithoutHeading1: Story = {
  args: {
    headingText: 'Information card with header level 1',
    icon: 'Book',
    children: 'This is an information card with heading.',
    headingLevel: '1',
  },
  render: (args: InformationCardProps) => <InformationCard {...args} />,
};
