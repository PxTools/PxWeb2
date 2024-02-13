import type { Meta, StoryFn } from '@storybook/react';
import { Ingress } from './Ingress';

const meta: Meta<typeof Ingress> = {
  component: Ingress,
  title: 'Components/Typography/Ingress',
};
export default meta;

const text =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export const Default = {
  args: {
    children: text,
    spacing: false,
    align: 'start',
    weight: 'regular',
    textcolor: 'default',
  },
};

export const Align: StoryFn<typeof Ingress> = () => {
  return (
    <>
      <h1>Align</h1>

      <h2>Default:</h2>
      <Ingress>{text}</Ingress>

      <h2>start:</h2>
      <Ingress align="start">{text}</Ingress>

      <h2>center:</h2>
      <Ingress align="center">{text}</Ingress>

      <h2>end:</h2>
      <Ingress align="end">{text}</Ingress>
    </>
  );
};

export const Spacing: StoryFn<typeof Ingress> = () => {
  return (
    <>
      <h1>Spacing</h1>

      <h2>Default:</h2>
      <Ingress>{text}</Ingress>

      <h2>spacing:</h2>
      <Ingress spacing>{text}</Ingress>

      <h2>no spacing:</h2>
      <Ingress>{text}</Ingress>
    </>
  );
};

export const Weight: StoryFn<typeof Ingress> = () => {
  return (
    <>
      <h1>Weight</h1>

      <h2>Default:</h2>
      <Ingress>{text}</Ingress>

      <h2>regular:</h2>
      <Ingress weight="regular">{text}</Ingress>

      <h2>bold:</h2>
      <Ingress weight="bold">{text}</Ingress>
    </>
  );
};

export const Textcolor: StoryFn<typeof Ingress> = () => {
  return (
    <>
      <h1>Textcolor</h1>

      <h2>Default:</h2>
      <Ingress>{text}</Ingress>

      <h2>default:</h2>
      <Ingress textcolor="default">{text}</Ingress>

      <h2>subtle:</h2>
      <Ingress textcolor="subtle">{text}</Ingress>
    </>
  );
};
