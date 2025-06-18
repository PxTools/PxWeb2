import { Meta, StoryObj } from '@storybook/react-vite';
import { MandatoryNotes } from './MandatoryNotes';
import { dummyNotes } from './notesDummyData';

const meta: Meta<typeof MandatoryNotes> = {
  component: MandatoryNotes,
  title: 'Components/Notes/MandatoryNotes',
};
export default meta;

type Story = StoryObj<typeof MandatoryNotes>;

export const Default: Story = {
  args: {
    notes: dummyNotes.mandatoryNotes,
  },
};
