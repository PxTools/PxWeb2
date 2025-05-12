import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { SymbolExplanationNotes } from './SymbolExplanationNotes';
import { dummyNotes } from './notesDummyData';

describe('SymbolExplanationNotes', () => {
  it('renders a single note correctly when there is only one note', () => {
    const singleNote = { A: 'Single note content' };
    render(<SymbolExplanationNotes notes={singleNote} />);
    const noteContent = screen.getByText('Single note content');
    expect(noteContent).toBeInTheDocument();
  });

  it('renders multiple notes correctly when there are multiple notes', () => {
    render(
      <SymbolExplanationNotes notes={dummyNotes.SymbolExplanationNotes} />,
    );
    Object.values(dummyNotes.SymbolExplanationNotes).forEach((note) => {
      const noteContent = screen.getByText(note);
      expect(noteContent).toBeInTheDocument();
    });
  });
});
