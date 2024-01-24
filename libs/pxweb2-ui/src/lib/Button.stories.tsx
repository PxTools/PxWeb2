import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Button } from './Button';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
};
export default meta;
type Story = StoryObj<typeof Button>;

export const ButtonSettings: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    children: 'Primary',
    iconOnly: false
  },
};

export const Variants: StoryFn<typeof Button> = () => {

  function test() { alert('test'); } 
  return (
    <>
    Primary 
      <Button iconOnly={false} variant="primary" isDisabled={false} onClick={test}>
        Button
      </Button>

      Primary with icon only medium
      <Button iconOnly={true} variant="primary" icon='Pencil' isDisabled={false} onClick={test}>
        Button
      </Button>
    </>
  );
};