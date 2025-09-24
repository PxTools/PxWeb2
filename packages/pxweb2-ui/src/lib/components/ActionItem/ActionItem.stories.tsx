import { Meta, StoryObj, StoryFn } from '@storybook/react-vite';
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
};

export default meta;

type Story = StoryObj<typeof ActionItem>;

export const Default: Story = {};

export const Variants: StoryFn<typeof ActionItem> = () => {
  return (
    <>
      Medium
      <br />
      <br />
      <ActionItem
        label="Medium Action"
        size="medium"
        onClick={() => alert('Clicked medium action!')}
      />
      <br />
      <br />
      <ActionItem
        label="Medium Action with Description"
        size="medium"
        description="This is a description."
        onClick={() => alert('Clicked medium action with description!')}
      />
      <br />
      <br />
      <ActionItem label="Medium Action" size="medium" disabled />
      <br />
      <br />
      Large
      <br />
      <br />
      <ActionItem
        label="Large Action"
        size="large"
        onClick={() => alert('Clicked large action!')}
      />
      <br />
      <br />
      <ActionItem
        label="Large Action"
        disabled
        size="large"
        onClick={() => alert('Clicked large action!')}
      />
    </>
  );
};
