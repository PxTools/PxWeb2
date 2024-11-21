import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

import { expect, within } from '@storybook/test';

const meta: Meta<typeof EmptyState> = {
  component: EmptyState,
  title: 'Components/EmptyState',
};
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    headingTxt: 'Welcome to EmptyState!',
    descriptionTxt: 'This is a description of the empty state.',
    svgName: 'ManWithMagnifyingGlass',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText(/Welcome to EmptyState!/i)).toBeTruthy();
    expect(
      canvas.getByText(/This is a description of the empty state./i)
    ).toBeTruthy();
  },
};
