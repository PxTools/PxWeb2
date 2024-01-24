import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  component: Button,
  title: 'Button',
};
export default meta;
type Story = StoryObj<typeof Button>;

function test() { alert('test'); }

export const ButtonSettings: Story = {
  args: {
    variant: 'primary',
    size: 'medium',
    children: 'Primary',
    iconOnly: false,
    onClick: test,
  },
};

export const Variants: StoryFn<typeof Button> = () => {
  return (
    <>
      Primary
      <br />
      <Button iconOnly={false} variant="primary" isDisabled={false} onClick={test}>
        Button
      </Button>
      <br />
      Primary with icon only medium
      <br />
      <Button iconOnly={true} variant="primary" icon='Pencil' isDisabled={false} onClick={test}>
        Button
      </Button>
      <br />
      Primary with icon only small
      <br />
      <Button iconOnly={true} variant="primary" icon='Pencil' isDisabled={false} onClick={test} size={'small'}>
        Button
      </Button>
      Primary disabled
      <br />
      <Button iconOnly={true} variant="primary" icon='Pencil' isDisabled={true} onClick={test}>
        Button
      </Button>
      <br />
      <br />
      Secondary
      <br />
      <Button iconOnly={false} variant="secondary" isDisabled={false} onClick={test}>
        Button
      </Button>
      <br />
      Secondary with icon only medium
      <br />
      <Button iconOnly={true} variant="secondary" icon='Pencil' isDisabled={false} onClick={test}>
        Button
      </Button>
      <br />
      Secondary with icon only small
      <br />
      <Button iconOnly={true} variant="secondary" icon='Pencil' isDisabled={false} onClick={test} size={'small'}>
        Button
      </Button>
      Secondary disabled
      <br />
      <Button iconOnly={true} variant="secondary" icon='Pencil' isDisabled={true} onClick={test}>
        Button
      </Button>
      <br />
      <br />
      Tertiary
      <br />
      <Button iconOnly={false} variant="tertiary" isDisabled={false} onClick={test}>
        Button
      </Button>
      <br />
      Tertiary with icon only medium
      <br />
      <Button iconOnly={true} variant="tertiary" icon='Pencil' isDisabled={false} onClick={test}>
        Button
      </Button>
      <br />
      Tertiary with icon only small
      <br />
      <Button iconOnly={true} variant="tertiary" icon='Pencil' isDisabled={false} onClick={test} size={'small'}>
        Button
      </Button>
      Tertiary disabled
      <br />
      <Button iconOnly={true} variant="tertiary" icon='Pencil' isDisabled={true} onClick={test}>
        Button
      </Button>
    </>
  );
};