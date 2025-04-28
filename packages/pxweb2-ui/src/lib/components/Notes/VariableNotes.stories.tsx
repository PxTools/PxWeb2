import { Meta, StoryObj } from '@storybook/react';
import { VariableNotes } from './VariableNotes';
import { dummyNotes } from './notesDummyData';

const meta: Meta<typeof VariableNotes> = {
  component: VariableNotes,
  title: 'Components/Notes/VariableNotes',
};
export default meta;

type Story = StoryObj<typeof VariableNotes>;

export const Default: Story = {
  args: {
    variableNotes: dummyNotes.mandatoryNotes.variableNotes[0],
    showVariableName: true,
  },
};
