import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { MandatoryNotes } from './MandatoryNotes';
import { dummyNotes } from './notesDummyData';

describe('MandatoryNotes', () => {
  it('renders MandatoryTableNotes when tableLevelNotes are present', () => {
    render(<MandatoryNotes notes={dummyNotes.mandatoryNotes} />);

    Object.values(dummyNotes.mandatoryNotes.tableLevelNotes).forEach((note) => {
      const noteContent = screen.getByText(note);
      expect(noteContent).toBeInTheDocument();
    });
  });

  it('renders MandatoryVariableNotes for each variable note', () => {
    render(<MandatoryNotes notes={dummyNotes.mandatoryNotes} />);

    dummyNotes.mandatoryNotes.variableNotes.forEach((variableNote) => {
      variableNote.notes.forEach((note) => {
        const noteContent = screen.getByText(note);
        expect(noteContent).toBeInTheDocument();
      });
    });
  });

  it('renders MandatoryValueNotes for each value note', () => {
    render(<MandatoryNotes notes={dummyNotes.mandatoryNotes} />);

    dummyNotes.mandatoryNotes.variableNotes[0].valueNotes.forEach((value) => {
      value.notes.forEach((note) => {
        const noteContent = screen.getByText(note);
        expect(noteContent).toBeInTheDocument();
      });
    });
  });
});
