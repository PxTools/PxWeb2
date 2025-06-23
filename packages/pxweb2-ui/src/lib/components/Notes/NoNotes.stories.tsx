import { Meta, StoryObj } from '@storybook/react-vite';
import { NoNotes } from './NoNotes';

const meta: Meta<typeof NoNotes> = {
  component: NoNotes,
  title: 'Components/Notes/NoNotes',
};
export default meta;

type Story = StoryObj<typeof NoNotes>;

export const Default: Story = {
  args: {
    tableLevel: true,
  },
};
