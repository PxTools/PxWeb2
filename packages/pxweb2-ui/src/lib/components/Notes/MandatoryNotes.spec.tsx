import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { MandatoryNotes } from './MandatoryNotes';
import { dummyNotes } from './notesDummyData';

describe('MandatoryNotes', () => {
  it('renders MandatoryVariableNotes for the first 3 variable notes', () => {
    render(<MandatoryNotes notes={dummyNotes.mandatoryNotes} />);

    dummyNotes.mandatoryNotes.variableNotes
      .slice(0, 3)
      .forEach((variableNote) => {
        variableNote.notes.forEach((note) => {
          const noteContent = screen.getByText(note);
          expect(noteContent).toBeInTheDocument();
        });
      });
  });

  it('renders markdown links as anchor tags syntax 1', () => {
    render(<MandatoryNotes notes={dummyNotes.mandatoryNotes} />);
    // Assuming '[SCB](https://scb.se)' is present in one of the notes
    const link = screen.getByRole('link', { name: 'SCB' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://scb.se');
  });

  it('renders markdown links as anchor tags syntax 2', () => {
    render(<MandatoryNotes notes={dummyNotes.mandatoryNotes} />);
    // Assuming '[SCB](https://scb.se)' is present in one of the notes
    const link = screen.getByRole('link', { name: 'https://scb.se/' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://scb.se/');
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
