import type { Meta, StoryFn } from '@storybook/react';
import { BodyShort } from './BodyShort';

const meta: Meta<typeof BodyShort> = {
  component: BodyShort,
  title: 'BodyShort',
};
export default meta;

const text = 'The BodyShort component will be used for text with not more than 80 characters.';

export const Default = {
  args: {
    children: text
  },
};

export const Size: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Size</h1>

      <h2>default:</h2>
      <BodyShort>{text}</BodyShort>

      <h2>medium:</h2>
      <BodyShort size='medium'>{text}</BodyShort>

      <h2>small:</h2>
      <BodyShort size='small'>{text}</BodyShort>
    </>
  );
};

export const Spacing: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Spacing</h1>

      <h2>size medium:</h2>
      <BodyShort size='medium' spacing>{text}</BodyShort>

      <h2>size medium no spacing:</h2>
      <BodyShort size='medium'>{text}</BodyShort>

      <h2>size small:</h2>
      <BodyShort size='small' spacing>{text}</BodyShort>

      <h2>size small no spacing:</h2>
      <BodyShort size='small'>{text}</BodyShort>
    </>
  );
};

export const Align: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Align</h1>

      <h2>Default:</h2>
      <BodyShort>{text}</BodyShort>

      <h2>left:</h2>
      <BodyShort align='left'>{text}</BodyShort>

      <h2>center:</h2>
      <BodyShort align='center'>{text}</BodyShort>

      <h2>right:</h2>
      <BodyShort align='right'>{text}</BodyShort>
    </>
  );
};

