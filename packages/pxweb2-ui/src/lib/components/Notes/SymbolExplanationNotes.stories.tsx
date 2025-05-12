import { Meta, StoryObj } from '@storybook/react';
import { SymbolExplanationNotes } from './SymbolExplanationNotes';
import { dummyNotes } from './notesDummyData';

const meta: Meta<typeof SymbolExplanationNotes> = {
  component: SymbolExplanationNotes,
  title: 'Components/Notes/SymbolExplanationNotes',
};
export default meta;

type Story = StoryObj<typeof SymbolExplanationNotes>;

export const Default: Story = {
  args: {
    notes: dummyNotes.SymbolExplanationNotes,
  },
};
