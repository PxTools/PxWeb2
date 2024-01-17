import type { Meta, StoryObj } from '@storybook/react';
import { Pxweb2Ui } from './pxweb2-ui';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof Pxweb2Ui> = {
  component: Pxweb2Ui,
  title: 'Pxweb2Ui',
};
export default meta;
type Story = StoryObj<typeof Pxweb2Ui>;

export const Primary = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to Pxweb2Ui!/gi)).toBeTruthy();
  },
};
