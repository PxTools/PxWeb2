import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { Radio } from './Radio';

const meta: Meta<typeof Radio> = {
  component: Radio,
  title: 'Components/Radio',
};
export default meta;

export const Default: StoryFn<typeof Radio> = () => {
  return (
    <Radio
      id="radio"
      text="Radio"
      value="radio"
    >
      Radio
    </Radio>
  );
};