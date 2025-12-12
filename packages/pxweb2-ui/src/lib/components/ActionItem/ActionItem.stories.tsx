import { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';

import { ActionItem } from './ActionItem';

const meta: Meta<typeof ActionItem> = {
  title: 'Components/ActionItem',
  component: ActionItem,
  args: {
    label: 'Action Item',
    ariaLabel: 'Action Aria Label',
    onClick: () => alert('Action clicked!'),
    iconName: 'BarChart',
    largeIconName: 'Table',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '400px' }}>
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof ActionItem>;

export const Default: Story = {};

export const LargeDefault: Story = {
  args: {
    largeIconName: 'Table',
    label: 'Action with description',
    size: 'large',
  },
};

export const MediumDefault: Story = {
  args: {
    iconName: 'File',
    label: 'Medium default',
    size: 'medium',
  },
};

export const MediumWithDescription: Story = {
  args: {
    iconName: 'File',
    label: 'Action with description',
    size: 'medium',
    description: 'This is a description of the action item.',
  },
};

export const MediumWithLoading: Story = {
  args: {
    iconName: 'File',
    label: 'Action with loading spinner',
    size: 'medium',
    isLoading: true,
  },
};

export const MediumToggleable = {
  args: {
    label: 'Toggleable Action',
    size: 'medium',
    toggleState: true,
  },
  render: function Render(args) {
    const [{ toggleState }, updateArgs] = useArgs();

    function handleClick() {
      updateArgs({ toggleState: !toggleState });
    }

    return <ActionItem {...args} onClick={handleClick} />;
  },
} satisfies Story;

export const LargeToggleable = {
  args: {
    label: 'Toggleable Action',
    size: 'large',
    toggleState: false,
  },
  render: function Render(args) {
    const [{ toggleState }, updateArgs] = useArgs();

    function handleClick() {
      updateArgs({ toggleState: !toggleState });
    }

    return <ActionItem {...args} onClick={handleClick} />;
  },
} satisfies Story;
