import type { Meta, StoryFn } from '@storybook/react';
import { BodyShort } from './BodyShort';

const meta: Meta<typeof BodyShort> = {
  component: BodyShort,
  title: 'Components/Typography/BodyShort',
};
export default meta;

const text =
  'The BodyShort component will be used for text with not more than 80 characters.';

export const Default = {
  args: {
    children: text,
    size: 'medium',
    spacing: false,
    align: 'start',
    weight: 'regular',
    textcolor: 'default',
  },
  argTypes: {
    size: {
      options: ['medium', 'small'],
      control: { type: 'radio' },
    },
  },
};

export const Size: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Size</h1>

      <h2>default:</h2>
      <BodyShort>{text}</BodyShort>

      <h2>medium:</h2>
      <BodyShort size="medium">{text}</BodyShort>

      <h2>small:</h2>
      <BodyShort size="small">{text}</BodyShort>
    </>
  );
};

export const Spacing: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Spacing</h1>

      <h2>size medium with spacing:</h2>
      <BodyShort size="medium" spacing>
        {text}
      </BodyShort>
      <BodyShort size="medium" spacing>
        {text}
      </BodyShort>

      <h2>size medium no spacing:</h2>
      <BodyShort size="medium">{text}</BodyShort>
      <BodyShort size="medium">{text}</BodyShort>

      <h2>size small with spacing:</h2>
      <BodyShort size="small" spacing>
        {text}
      </BodyShort>
      <BodyShort size="small" spacing>
        {text}
      </BodyShort>

      <h2>size small no spacing:</h2>
      <BodyShort size="small">{text}</BodyShort>
      <BodyShort size="small">{text}</BodyShort>
    </>
  );
};

export const Align: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Align</h1>

      <h2>Default:</h2>
      <BodyShort>{text}</BodyShort>

      <h2>start:</h2>
      <BodyShort align="start">{text}</BodyShort>

      <h2>center:</h2>
      <BodyShort align="center">{text}</BodyShort>

      <h2>end:</h2>
      <BodyShort align="end">{text}</BodyShort>
    </>
  );
};

export const Weight: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Weight</h1>

      <h2>Default:</h2>
      <BodyShort>{text}</BodyShort>

      <h2>regular:</h2>
      <BodyShort weight="regular">{text}</BodyShort>

      <h2>bold:</h2>
      <BodyShort weight="bold">{text}</BodyShort>
    </>
  );
};

export const Textcolor: StoryFn<typeof BodyShort> = () => {
  return (
    <>
      <h1>Textcolor</h1>

      <h2>Default:</h2>
      <BodyShort>{text}</BodyShort>

      <h2>default:</h2>
      <BodyShort textcolor="default">{text}</BodyShort>

      <h2>subtle:</h2>
      <BodyShort textcolor="subtle">{text}</BodyShort>
    </>
  );
};
