import { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { CheckCircleToggle } from './CheckCircleToggle';

const meta: Meta<typeof CheckCircleToggle> = {
  title: 'Components/CheckCircle/CheckCircleToggle',
  component: CheckCircleToggle,
  args: {
    checked: false,
    label: 'Toggle label',
  },
  argTypes: {
    checked: { control: 'boolean' },
    label: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Toggle button with a circular check indicator. Used to represent checked/unchecked states.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CheckCircleToggle>;

const Render = (
  args: Story['args'] & { onChange?: (next: boolean) => void },
) => {
  const [checked, setChecked] = useState<boolean>(!!args?.checked);

  return (
    <CheckCircleToggle
      {...args}
      checked={checked}
      label={args?.label ?? 'Toggle label'}
      onChange={(next) => {
        setChecked(next);
        args.onChange?.(next);
      }}
    />
  );
};

export const Unchecked: Story = {
  render: Render,
  args: { checked: false },
  parameters: {
    docs: {
      description: {
        story: 'Renders the toggle in the unchecked state.',
      },
    },
  },
};

export const Checked: Story = {
  render: Render,
  args: { checked: true },
  parameters: {
    docs: {
      description: {
        story: 'Renders the toggle in the checked state.',
      },
    },
  },
};
