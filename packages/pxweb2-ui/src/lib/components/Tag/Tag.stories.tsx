import type { Meta, StoryFn } from '@storybook/react';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = {
  component: Tag,
  title: 'Components/Tag',
};
export default meta;

const text = 'Tag';

export const Default = {
  args: {
    size: 'medium',
    variant: 'neutral',
    type: 'default',
    children: text,
  },
  argTypes: {
    size: {
      options: ['medium', 'small', 'xsmall'],
      control: { type: 'radio' },
    },
    variant: {
      options: ['neutral', 'info', 'success', 'warning', 'error'],
      control: { type: 'radio' },
    },
    type: {
      options: ['default', 'border'],
      control: { type: 'radio' },
    },
  },
};

export const Size: StoryFn<typeof Tag> = () => {
  return (
    <>
      <h1>Size</h1>

      <h2>default:</h2>
      <Tag>{text}</Tag>

      <h2>medium:</h2>
      <Tag size="medium">{text}</Tag>

      <h2>small:</h2>
      <Tag size="small">{text}</Tag>

      <h2>xsmall:</h2>
      <Tag size="xsmall">{text}</Tag>
    </>
  );
};

export const Variant: StoryFn<typeof Tag> = () => {
  return (
    <>
      <h1>Variant</h1>

      <h2>default:</h2>
      <Tag>{text}</Tag>

      <h2>neutral:</h2>
      <Tag variant="neutral">{text}</Tag>

      <h2>info:</h2>
      <Tag variant="info">{text}</Tag>

      <h2>success:</h2>
      <Tag variant="success">{text}</Tag>

      <h2>warning:</h2>
      <Tag variant="warning">{text}</Tag>

      <h2>error:</h2>
      <Tag variant="error">{text}</Tag>
    </>
  );
};

export const Type: StoryFn<typeof Tag> = () => {
  return (
    <>
      <h1>Type</h1>

      <h2>default:</h2>
      <Tag type="default">{text}</Tag>

      <h2>border:</h2>
      <Tag type="border">{text}</Tag>
    </>
  );
};
