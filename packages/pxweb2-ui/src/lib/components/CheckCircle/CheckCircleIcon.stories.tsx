import { Meta, StoryObj } from '@storybook/react-vite';
import { CheckCircleIcon } from './CheckCircleIcon';

const meta: Meta<typeof CheckCircleIcon> = {
  title: 'Components/CheckCircle/CheckCircleIcon',
  component: CheckCircleIcon,
  args: {
    checked: false,
  },
  argTypes: {
    checked: { control: 'boolean' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'A circular status indicator that can show checked/unchecked states. Will be used in CheckCircle and other components like ActionItem.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CheckCircleIcon>;

export const Unchecked: Story = {
  args: { checked: false },
  parameters: {
    docs: {
      description: {
        story: 'Renders the icon in the unchecked state.',
      },
    },
  },
};

export const Checked: Story = {
  args: { checked: true },
  parameters: {
    docs: {
      description: {
        story: 'Renders the icon in the checked state.',
      },
    },
  },
};
