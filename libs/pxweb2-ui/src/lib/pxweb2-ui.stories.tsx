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
  args: {
    title: 'pxweb2-ui primary!',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    title: 'pxweb2-ui secondary!',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/pxweb2-ui secondary!/gi)).toBeTruthy();
  },
};

