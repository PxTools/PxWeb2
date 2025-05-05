import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { NoNotes } from './NoNotes';

describe('NoNotes', () => {
  it('renders the correct heading', () => {
    render(<NoNotes tableLevel={true} />);
    expect(
      screen.getByText(
        'presentation_page.main_content.about_table.footnotes.missing_heading',
      ),
    ).toBeInTheDocument();
  });

  it('renders the correct text for tableLevel=true', () => {
    render(<NoNotes tableLevel={true} />);
    expect(
      screen.getByText(
        'presentation_page.main_content.about_table.footnotes.missing_text_table',
      ),
    ).toBeInTheDocument();
  });

  it('renders the correct text for tableLevel=false', () => {
    render(<NoNotes tableLevel={false} />);
    expect(
      screen.getByText(
        'presentation_page.main_content.about_table.footnotes.missing_text_selection',
      ),
    ).toBeInTheDocument();
  });
});
