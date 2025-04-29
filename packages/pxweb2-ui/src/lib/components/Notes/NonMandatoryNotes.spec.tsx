import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { NonMandatoryNotes } from './NonMandatoryNotes';
import { dummyNotes } from './notesDummyData';

describe('NonMandatoryNotes', () => {
  it('renders non mandatory table notes when tableLevelNotes are present', () => {
    render(<NonMandatoryNotes notes={dummyNotes.nonMandatoryNotes} />);

    Object.values(dummyNotes.nonMandatoryNotes.tableLevelNotes).forEach(
      (note) => {
        const noteContent = screen.getByText(note);
        expect(noteContent).toBeInTheDocument();
      },
    );
  });

  it('renders non mandatory variable notes for each variable note', () => {
    render(<NonMandatoryNotes notes={dummyNotes.nonMandatoryNotes} />);

    dummyNotes.nonMandatoryNotes.variableNotes.forEach((variableNote) => {
      variableNote.notes.forEach((note) => {
        const noteContent = screen.getByText(note);
        expect(noteContent).toBeInTheDocument();
      });
    });
  });

  it('renders non mandatory value notes for each value note', () => {
    render(<NonMandatoryNotes notes={dummyNotes.nonMandatoryNotes} />);

    dummyNotes.nonMandatoryNotes.variableNotes[0].valueNotes.forEach(
      (value) => {
        value.notes.forEach((note) => {
          const noteContent = screen.getByText(note);
          expect(noteContent).toBeInTheDocument();
        });
      },
    );
  });
});
