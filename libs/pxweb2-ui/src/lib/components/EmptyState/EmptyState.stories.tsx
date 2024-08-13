import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { EmptyState } from './EmptyState';

import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

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

    expect(canvas.getByText(/Welcome to EmptyState!/gi)).toBeTruthy();
    expect(
      canvas.getByText(/This is a description of the empty state./gi)
    ).toBeTruthy();
  },
};

export const Illustration_Sizes: StoryFn<typeof EmptyState> = () => {
  return (
    <>
      <br />
      <div style={{ width: '520px' }}>
        <EmptyState
          headingTxt="Welcome to EmptyState!"
          descriptionTxt="This shows a large illustration."
          svgName="ManWithMagnifyingGlass"
        />
      </div>
      <br />
      <div style={{ width: '479px' }}>
        <EmptyState
          headingTxt="Welcome to EmptyState!"
          descriptionTxt="This shows a small illustration."
          svgName="ManWithMagnifyingGlass"
        />
      </div>
    </>
  );
};
