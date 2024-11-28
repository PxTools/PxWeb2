import type { Meta, StoryFn } from '@storybook/react';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  component: Label,
  title: 'Components/Typography/Label',
};
export default meta;

const text = 'This is a label';

export const Default = {
  args: {
    children: text,
    size: 'medium',
    textcolor: 'default',
    visuallyHidden: false,
  },
  argTypes: {
    size: {
      options: ['medium', 'small'],
      control: { type: 'radio' },
    },
  },
};

export const Size: StoryFn<typeof Label> = () => {
  return (
    <>
      <h1>Size</h1>

      <h2>default:</h2>
      <Label>{text}</Label>

      <h2>medium:</h2>
      <Label size="medium">{text}</Label>

      <h2>small:</h2>
      <Label size="small">{text}</Label>
    </>
  );
};

export const Textcolor: StoryFn<typeof Label> = () => {
  return (
    <>
      <h1>Textcolor</h1>

      <h2>Default:</h2>
      <Label>{text}</Label>

      <h2>default:</h2>
      <Label textcolor="default">{text}</Label>

      <h2>subtle:</h2>
      <Label textcolor="subtle">{text}</Label>
    </>
  );
};

export const VisuallyHidden: StoryFn<typeof Label> = () => {
  return (
    <>
      <h1>VisuallyHidden</h1>

      <h2>Default:</h2>
      <Label>{text}</Label>

      <h2>hidden:</h2>
      <Label visuallyHidden>{text}</Label>
    </>
  );
};

export const LabelFor: StoryFn<typeof Label> = () => {
  return (
    <>
      <h1>Label for</h1>

      <Label htmlFor="fname">First name:</Label>
      <br />
      <input type="text" id="fname" name="fname" defaultValue="John" />
      <br />
      <Label htmlFor="lname">Last name:</Label>
      <br />
      <input type="text" id="lname" name="lname" defaultValue="Doe" />
    </>
  );
};
