import { Meta, StoryObj } from '@storybook/react-vite';
import { NonMandatoryNotes } from './NonMandatoryNotes';
import { dummyNotes } from './notesDummyData';

const meta: Meta<typeof NonMandatoryNotes> = {
  component: NonMandatoryNotes,
  title: 'Components/Notes/NonMandatoryNotes',
};
export default meta;

type Story = StoryObj<typeof NonMandatoryNotes>;

export const Default: Story = {
  args: {
    notes: dummyNotes.nonMandatoryNotes,
  },
};
