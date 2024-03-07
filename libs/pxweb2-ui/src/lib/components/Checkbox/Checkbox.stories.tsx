import type { Meta, StoryFn } from '@storybook/react';
import { Checkbox } from './Checkbox';

/* import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest'; */

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Components/Checkbox',
};
export default meta;

export const Variants: StoryFn<typeof Checkbox> = () => {
  return (
    <>
      <Checkbox
        id="test"
        text="Variable 1"
        onChange={(val) => {
          console.log(val);
        }}
        value={true}
      />
      <br />
      <Checkbox
        id="test"
        text="Variable 2"
        onChange={(val) => {
          console.log(val);
        }}
        value={true}
      />
      <br />
    </>
  );
};
