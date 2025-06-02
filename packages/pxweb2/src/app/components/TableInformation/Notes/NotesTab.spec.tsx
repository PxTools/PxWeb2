import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '../../../util/testing-utils';

// Mock useVariables to return pxTableMetadata with no notes
vi.mock('../../../context/useVariables', () => ({
  default: () => ({
    pxTableMetadata: {
      variables: [], // no variables
      notes: [], // no table-level notes
    },
  }),
}));

vi.mock('../../../util/config/getConfig', () => ({
  getConfig: () => ({
    specialCharacters: ['.', '..', ':', '-', '...', '*'],
  }),
}));

// This import must be placed AFTER the mock to ensure it uses the mocked context
import { NotesTab } from './NotesTab';

describe('NotesTab', () => {
  it('displays NoNotes if there are no notes in metadata', () => {
    renderWithProviders(
      <NotesTab
        pxTableMetadata={{
          id: 'test-id',
          language: 'en',
          label: 'Test Table',
          updated: new Date('2024-01-01'),
          source: '',
          description: '',
          descriptionDefault: false,
          copyright: false,
          contacts: [],
          officialStatistics: false,
          variables: [],
          notes: [],
          link: '',
          matrix: '',
          infofile: '',
          decimals: 0,
          aggregationAllowed: false,
          contents: '',
          subjectCode: '',
          subjectArea: '',
        }}
      />,
    );

    expect(
      screen.getByText(
        'presentation_page.main_content.about_table.footnotes.missing_text_table',
      ),
    ).toBeInTheDocument();
  });

  it('displays a character explanation note when there are no other notes', () => {
    renderWithProviders(
      <NotesTab
        pxTableMetadata={{
          id: 'test-id',
          language: 'en',
          label: 'Test Table',
          updated: new Date('2024-01-01'),
          source: '',
          description: '',
          descriptionDefault: false,
          copyright: false,
          contacts: [],
          officialStatistics: false,
          variables: [],
          notes: [{ text: '.. = No data', mandatory: false }],
          link: '',
          matrix: '',
          infofile: '',
          decimals: 0,
          aggregationAllowed: false,
          contents: '',
          subjectCode: '',
          subjectArea: '',
        }}
      />,
    );

    expect(screen.getByText('.. = No data')).toBeInTheDocument();
  });
});
