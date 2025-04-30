import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { MandatoryVariableNotes } from './MandatoryVariableNotes';
import { dummyNotes } from './notesDummyData';

describe('MandatoryVariableNotes', () => {
  it('renders the component with the correct heading', () => {
    render(
      <MandatoryVariableNotes
        variableNotes={dummyNotes.mandatoryNotes.variableNotes[0]}
      />,
    );
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent(
      `presentation_page.main_content.about_table.footnotes.mandatory_variable_heading ${dummyNotes.mandatoryNotes.variableNotes[0].variableName}`,
    );
  });

  it('renders the VariableNotes component', () => {
    render(
      <MandatoryVariableNotes
        variableNotes={dummyNotes.mandatoryNotes.variableNotes[0]}
      />,
    );
    const variableNotesElement = screen.getByText(
      dummyNotes.mandatoryNotes.variableNotes[0].notes[0],
    );
    expect(variableNotesElement).toBeInTheDocument();
  });
});
