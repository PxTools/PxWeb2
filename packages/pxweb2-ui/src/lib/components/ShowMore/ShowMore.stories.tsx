import type { Meta, StoryObj } from '@storybook/react-vite';

import { ShowMore } from './ShowMore';

const meta: Meta<typeof ShowMore> = {
  component: ShowMore,
  title: 'Components/ShowMore',
};
export default meta;

type Story = StoryObj<typeof ShowMore>;

const text =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

export const Default: Story = {
  args: {
    header: 'Show More',
    children: text,
  },
};
