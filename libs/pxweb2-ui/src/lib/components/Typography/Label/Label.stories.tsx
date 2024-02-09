import type { Meta, StoryFn } from '@storybook/react';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  component: Label,
  title: 'Label',
};
export default meta;

const text = 'This is a label';

export const Default = {
  args: {
    children: text
  },
  argTypes: {
    size: {
      options: ['medium', 'small'],
      control: { type: 'radio' }
    }
  }
};

export const Size: StoryFn<typeof Label> = () => {
  return (
    <>
      <h1>Size</h1>

      <h2>default:</h2>
      <Label>{text}</Label>

      <h2>medium:</h2>
      <Label size='medium'>{text}</Label>

      <h2>small:</h2>
      <Label size='small'>{text}</Label>
    </>
  );
};

export const Align: StoryFn<typeof Label> = () => {
  return (
    <>
      <h1>Align</h1>

      <h2>Default:</h2>
      <Label>{text}</Label>

      <h2>start:</h2>
      <Label align='start'>{text}</Label>

      <h2>center:</h2>
      <Label align='center'>{text}</Label>

      <h2>end:</h2>
      <Label align='end'>{text}</Label>
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
      <Label textcolor='default'>{text}</Label>

      <h2>subtle:</h2>
      <Label textcolor='subtle'>{text}</Label>
    </>
  );
};
