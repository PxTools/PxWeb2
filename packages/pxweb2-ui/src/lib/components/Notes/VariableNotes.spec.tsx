import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { VariableNotes } from './VariableNotes';
import { variableNotes } from './noteCollection';

describe('VariableNotes Component', () => {
  const mockVariableNotes: variableNotes = {
    variableName: 'TestVariable',
    variableCode: 'testCode',
    notes: ['Note 1', 'Note 2'],
    valueNotes: [
      {
        valueCode: 'valueCode1',
        valueName: 'Value 1',
        notes: ['Value Note 1', 'Value Note 2'],
      },
    ],
  };

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
    expect(screen.getByText('TestVariable')).toBeInTheDocument();
    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });

  it('renders value notes as nested lists when valueNotes are present', () => {
    render(<VariableNotes variableNotes={mockVariableNotes} />);
    expect(screen.getByText('Value 1')).toBeInTheDocument();
    expect(screen.getByText('Value Note 1')).toBeInTheDocument();
    expect(screen.getByText('Value Note 2')).toBeInTheDocument();
  });

  it('does not render a heading when showVariableName is false', () => {
    render(
      <VariableNotes
        variableNotes={mockVariableNotes}
        showVariableName={false}
      />,
    );
    expect(screen.queryByText('TestVariable')).not.toBeInTheDocument();
  });

  it('renders an empty component when notes and valueNotes are empty', () => {
    render(
      <VariableNotes
        variableNotes={{ ...mockVariableNotes, notes: [], valueNotes: [] }}
      />,
    );
    expect(screen.queryByText('Note 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Value 1')).not.toBeInTheDocument();
  });
});
