import type { Meta, StoryObj } from '@storybook/react-vite';
import { ActionItem } from './ActionItem';

const meta: Meta<typeof ActionItem> = {
  title: 'Components/ActionItem',
  component: ActionItem,
  args: {
    ariaLabel: 'Action item',
    onClick: () => alert('Action clicked!'),
    iconName: 'BarChart',
    largeIconName: 'Table',
  },
};

export default meta;

type Story = StoryObj<typeof ActionItem>;

export const Default: Story = {};

export const LargeDefault: Story = {
  args: {
    largeIconName: 'Table',
    ariaLabel: 'Action with description',
    size: 'large',
  },
};

export const MediumDefault: Story = {
  args: {
    iconName: 'File',
    ariaLabel: 'Medium default',
    size: 'medium',
  },
};

export const MediumWithDescription: Story = {
  args: {
    iconName: 'File',
    ariaLabel: 'Action with description',
    size: 'medium',
    description: 'This is a description of the action item.',
  },
};
