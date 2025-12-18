import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { SymbolExplanationNotes } from './SymbolExplanationNotes';
import { dummyNotes } from './notesDummyData';

describe('SymbolExplanationNotes', () => {
  it('renders InformationCard heading as level 3 (h3)', () => {
    render(<SymbolExplanationNotes notes={{ A: 'Note' }} />);
    const headingKey =
      'presentation_page.main_content.about_table.footnotes.symbol_explanation_heading';
    const heading = screen.getByRole('heading', {
      level: 3,
      name: headingKey,
    });
    expect(heading).toBeInTheDocument();
  });

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
