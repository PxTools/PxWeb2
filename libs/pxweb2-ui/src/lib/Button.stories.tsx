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
    onClick: test,
  },
};

export const Variants: StoryFn<typeof Button> = () => {
  return (
    <>
      Primary
      <br />
      <Button variant="primary" onClick={test}>
        Button
      </Button>
      <br />
      Primary with icon only medium
      <br />
      <Button variant="primary" icon='Pencil' onClick={test}></Button>
      <br />
      Primary with icon only small
      <br />
      <Button variant="primary" icon='Pencil' onClick={test} size={'small'}></Button>
      Primary disabled
      <br />
      <Button variant="primary" icon='Pencil' disabled onClick={test}></Button>
      <br />
      <br />
      Secondary
      <br />
      <Button variant="secondary" onClick={test}>
        Button
      </Button>
      <br />
      Secondary with icon only medium
      <br />
      <Button variant="secondary" icon='Pencil' onClick={test}></Button>
      <br />
      Secondary with icon only small
      <br />
      <Button variant="secondary" icon='Pencil' onClick={test} size={'small'}></Button>
      Secondary disabled
      <br />
      <Button variant="secondary" icon='Pencil' disabled onClick={test}></Button>
      <br />
      <br />
      Tertiary
      <br />
      <Button variant="tertiary" onClick={test}>
        Button
      </Button>
      <br />
      Tertiary with icon only medium
      <br />
      <Button variant="tertiary" icon='Pencil' onClick={test}></Button>
      <br />
      Tertiary with icon only small
      <br />
      <Button variant="tertiary" icon='Pencil' onClick={test} size={'small'}></Button>
      Tertiary disabled
      <br />
      <Button variant="tertiary" icon='Pencil' disabled onClick={test}></Button>
    </>
  );
};