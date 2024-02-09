import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { BodyLong } from './BodyLong';

const meta: Meta<typeof BodyLong> = {
  component: BodyLong,
  title: 'Component/Typography/BodyLong',
};
export default meta;
type Story = StoryObj<typeof BodyLong>;

export const Variant: Story = {
  args: {
    children:
      'This is a story about Little Red Ridinghood. One day she went into the wood to visit her grandmother. The day after too, She visited her every day, every week, every month, every year. She never saw a wolf, no even a little fox. ',
  },
  argTypes: {
    size: {
      options: ['medium', 'small'],
      control: { type: 'radio' },
    },
  },
};

export const MediumWithSpacing: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <BodyLong size="medium" spacing>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <BodyLong size="medium" spacing>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <hr></hr>
    </>
  );
};

export const MediumWithoutSpacing: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <BodyLong size="medium">
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <BodyLong size="medium">
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <hr></hr>
    </>
  );
};

export const SmallWithSpacing: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <BodyLong size="small" spacing>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <BodyLong size="small" spacing>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <hr></hr>
    </>
  );
};

export const SmallWithoutSpacing: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <BodyLong size="small">
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <BodyLong size="small">
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox.
      </BodyLong>
      <hr></hr>
    </>
  );
};
