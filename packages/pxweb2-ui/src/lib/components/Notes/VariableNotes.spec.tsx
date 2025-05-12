import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { VariableNotes } from './VariableNotes';
import { variableNotes } from './noteCollection';
import { dummyNotes } from './notesDummyData';

describe('VariableNotes Component', () => {
  const mockVariableNotes: variableNotes =
    dummyNotes.nonMandatoryNotes.variableNotes[0];

  it('renders a single note when showVariableName is false and there is only one note', () => {
    render(
      <VariableNotes
        variableNotes={{
          ...mockVariableNotes,
          notes: ['Single Note'],
          valueNotes: [],
        }}
        showVariableName={false}
      />,
    );
    expect(screen.getByText('Single Note')).toBeInTheDocument();
  });

  it('renders a list of notes with a heading when showVariableName is true', () => {
    render(
      <VariableNotes
        variableNotes={mockVariableNotes}
        showVariableName={true}
      />,
    );
    expect(screen.getByText('Variable 1')).toBeInTheDocument();
    expect(
      screen.getByText('This is a note for Variable 1.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This is another note for Variable 1.'),
    ).toBeInTheDocument();
  });

  it('renders value notes as nested lists when valueNotes are present', () => {
    render(<VariableNotes variableNotes={mockVariableNotes} />);
    expect(screen.getByText('Value 2')).toBeInTheDocument();
    expect(screen.getByText('Note for Value 2')).toBeInTheDocument();
    expect(screen.getByText('Another note for Value 2')).toBeInTheDocument();
  });

  it('does not render a heading when showVariableName is false', () => {
    render(
      <VariableNotes
        variableNotes={mockVariableNotes}
        showVariableName={false}
      />,
    );
    expect(screen.queryByText('Variable 1')).not.toBeInTheDocument();
  });

  it('renders an empty component when notes and valueNotes are empty', () => {
    render(
      <VariableNotes
        variableNotes={{ ...mockVariableNotes, notes: [], valueNotes: [] }}
      />,
    );
    expect(screen.queryByText('Note for Value 2')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Another note for Value 2'),
    ).not.toBeInTheDocument();
  });
});
