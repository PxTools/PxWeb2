import { Meta, StoryObj } from '@storybook/react';
import { MandatoryTableNotes } from './MandatoryTableNotes';

const meta: Meta<typeof MandatoryTableNotes> = {
  component: MandatoryTableNotes,
  title: 'Components/Notes/MandatoryTableNotes',
};
export default meta;

type Story = StoryObj<typeof MandatoryTableNotes>;

export const Default: Story = {
  args: {
    notes: [
      'This is a mandatory note for the table.',
      'This is another mandatory note for the table.',
      'This is a third mandatory note for the table.',
    ],
  },
};

export const OnlyOne: Story = {
  args: {
    notes: ['This is a mandatory note for the table.'],
  },
};
