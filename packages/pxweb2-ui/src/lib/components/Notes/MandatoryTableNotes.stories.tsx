import { Meta, StoryObj } from '@storybook/react-vite';
import { MandatoryTableNotes } from './MandatoryTableNotes';
import { dummyNotes } from './notesDummyData';

const meta: Meta<typeof MandatoryTableNotes> = {
  component: MandatoryTableNotes,
  title: 'Components/Notes/MandatoryTableNotes',
};
export default meta;

type Story = StoryObj<typeof MandatoryTableNotes>;

export const Default: Story = {
  args: {
    notes: dummyNotes.mandatoryNotes.tableLevelNotes,
  },
};

export const OnlyOne: Story = {
  args: {
    notes: ['This is a mandatory note for the table.'],
  },
};
