import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { MandatoryTableNotes } from './MandatoryTableNotes';
import { dummyNotes } from './notesDummyData';

describe('MandatoryTableNotes', () => {
  it('renders a single note correctly', () => {
    const notes = ['This is a mandatory note'];
    render(<MandatoryTableNotes notes={notes} />);

    expect(screen.getByText('This is a mandatory note')).toBeInTheDocument();
  });

  it('renders multiple notes as a list', () => {
    render(
      <MandatoryTableNotes notes={dummyNotes.mandatoryNotes.tableLevelNotes} />,
    );

    dummyNotes.mandatoryNotes.tableLevelNotes.slice(0, 3).forEach((note) => {
      expect(screen.getByText(note)).toBeInTheDocument();
    });
  });
});
