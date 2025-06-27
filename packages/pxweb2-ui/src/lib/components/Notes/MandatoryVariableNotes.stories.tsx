import { Meta, StoryObj } from '@storybook/react-vite';
import { MandatoryVariableNotes } from './MandatoryVariableNotes';
import { dummyNotes } from './notesDummyData';

const meta: Meta<typeof MandatoryVariableNotes> = {
  component: MandatoryVariableNotes,
  title: 'Components/Notes/MandatoryVariableNotes',
};
export default meta;

type Story = StoryObj<typeof MandatoryVariableNotes>;

export const Default: Story = {
  args: {
    variableNotes: dummyNotes.mandatoryNotes.variableNotes[0],
  },
};
