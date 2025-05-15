import type { Meta, StoryFn } from '@storybook/react';

import { RangeSlider } from './RangeSlider';

const meta: Meta<typeof RangeSlider> = {
  component: RangeSlider,
  title: 'Components/RangeSlider',
};
export default meta;

export const DefaultSlider: StoryFn<typeof RangeSlider> = () => {
  return <RangeSlider />;
};
