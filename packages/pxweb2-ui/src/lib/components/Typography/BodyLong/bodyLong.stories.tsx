import type { Meta, StoryObj, StoryFn } from '@storybook/react-vite';
import { BodyLong } from './BodyLong';

const meta: Meta<typeof BodyLong> = {
  component: BodyLong,
  title: 'Components/Typography/BodyLong',
};
export default meta;
const text =
  'This is a story about Little Red Ridinghood. One day she went into the wood to visit her grandmother. The day after too, She visited her every day, every week, every month, every year. She never saw a wolf, no even a little fox.';
type Story = StoryObj<typeof BodyLong>;

export const Default: Story = {
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

export const Size: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Size</h1>

      <h2>default:</h2>
      <BodyLong>{text}</BodyLong>

      <h2>medium:</h2>
      <BodyLong size="medium">{text}</BodyLong>

      <h2>small:</h2>
      <BodyLong size="small">{text}</BodyLong>
    </>
  );
};

export const Spacing: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Spacing</h1>

      <h2>size medium with spacing:</h2>
      <BodyLong size="medium" spacing>
        {text}
      </BodyLong>
      <BodyLong size="medium" spacing>
        {text}
      </BodyLong>

      <h2>size medium no spacing:</h2>
      <BodyLong size="medium">{text}</BodyLong>
      <BodyLong size="medium">{text}</BodyLong>

      <h2>size small with spacing:</h2>
      <BodyLong size="small" spacing>
        {text}
      </BodyLong>
      <BodyLong size="small" spacing>
        {text}
      </BodyLong>

      <h2>size small no spacing:</h2>
      <BodyLong size="small">{text}</BodyLong>
      <BodyLong size="small">{text}</BodyLong>
    </>
  );
};

export const Align: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Align</h1>

      <h2>Default:</h2>
      <BodyLong>{text}</BodyLong>

      <h2>start:</h2>
      <BodyLong align="start">{text}</BodyLong>

      <h2>center:</h2>
      <BodyLong align="center">{text}</BodyLong>

      <h2>end:</h2>
      <BodyLong align="end">{text}</BodyLong>
    </>
  );
};

export const Weight: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Weight</h1>

      <h2>Default:</h2>
      <BodyLong>{text}</BodyLong>

      <h2>regular:</h2>
      <BodyLong weight="regular">{text}</BodyLong>

      <h2>bold:</h2>
      <BodyLong weight="bold">{text}</BodyLong>
    </>
  );
};

export const Textcolor: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Textcolor</h1>

      <h2>Default:</h2>
      <BodyLong>{text}</BodyLong>

      <h2>default:</h2>
      <BodyLong textcolor="default">{text}</BodyLong>

      <h2>subtle:</h2>
      <BodyLong textcolor="subtle">{text}</BodyLong>
    </>
  );
};
