import type { Meta, StoryObj } from '@storybook/react';
import { BodyLong } from './bodyLong';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { Children } from 'react';

const meta: Meta<typeof BodyLong> = {
  component: BodyLong,
  title: 'BodyLong',
};
export default meta;
type Story = StoryObj<typeof BodyLong>;

export const Small = {
  args: {children:"Dette er en liten lang historie",
size:"small"}
};
export const Medium = {
  args: {children:"Dette er en medium lang historie",
size:"medium"}
};

export const Heading: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText(/Welcome to BodyLong!/gi)).toBeTruthy();
  },
};
