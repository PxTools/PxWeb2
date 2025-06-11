import { Meta, StoryObj } from '@storybook/react';
import { ActionItem } from './ActionItem';
//import classes from './ActionItem.module.scss';

const meta: Meta<typeof ActionItem> = {
  title: 'Components/ActionItem',
  component: ActionItem,
  args: {
    ariaLabel: 'Click me',
    onClick: () => alert('Action clicked!'),
    icon: 'BarChart', // new property example
    size: 'large', // new property example
  },
};

export default meta;

type Story = StoryObj<typeof ActionItem>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    icon: 'File',
    ariaLabel: 'Action with description',
    size: 'medium',
    description: 'This is a description of the action item.',
  },
};
