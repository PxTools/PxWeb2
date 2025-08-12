import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import DrawerSave from './DrawerSave';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'presentation_page.sidemenu.save.savequery.title') {
        return 'Save Query';
      }
      if (key === 'presentation_page.sidemenu.save.savequery.info') {
        return 'Save your query for later use.';
      }
      if (key === 'presentation_page.sidemenu.save.savequery.radioLegend') {
        return 'Period options';
      }
      if (
        key ===
        'presentation_page.sidemenu.save.savequery.periodOptions.selected'
      ) {
        return 'Selected';
      }
      if (
        key === 'presentation_page.sidemenu.save.savequery.periodOptions.from'
      ) {
        return 'From';
      }
      if (
        key === 'presentation_page.sidemenu.save.savequery.periodOptions.top'
      ) {
        return 'Top';
      }
      if (key === 'presentation_page.sidemenu.save.savequery.createButton') {
        return 'Create';
      }
      if (key === 'presentation_page.sidemenu.save.savequery.copyButton') {
        return 'Copy';
      }
      if (key === 'presentation_page.sidemenu.save.savequery.copiedButton') {
        return 'Copied';
      }
      if (key === 'presentation_page.sidemenu.save.savequery.copyStatus') {
        return `Copied: ${opts?.url}`;
      }
      if (key === 'presentation_page.sidemenu.save.savequery.createStatus') {
        return `Created: ${opts?.query}`;
      }
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

// Mock context and export utils
vi.mock('../../../context/useVariables', () => ({
  default: () => ({
    getUniqueIds: () => ['var1'],
    getSelectedValuesByIdSorted: () => ['A', 'B'],
    getSelectedCodelistById: () => undefined,
  }),
}));
vi.mock('../../../context/useTableData', () => ({
  default: () => ({
    data: {
      heading: [{ id: 'var1' }],
      stub: [{ id: 'var2' }],
      metadata: {
        variables: [
          { id: 'var1', type: 'TIME_VARIABLE' },
          { id: 'var2', type: 'OTHER' },
        ],
      },
    },
  }),
}));
vi.mock('../../../util/export/exportUtil', () => ({
  applyTimeFilter: (codes: string[]) => codes,
  createNewSavedQuery: vi.fn(() => Promise.resolve('query123')),
  createSavedQueryURL: (id: string) => `https://example.com/query/${id}`,
}));

describe('DrawerSave ContentBox (savequery section)', () => {
  it('renders info card, radio group, and create button', () => {
    render(<DrawerSave tableId="table1" />);
    expect(screen.getByText('Save Query')).toBeInTheDocument();
    expect(
      screen.getByText('Save your query for later use.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Period options')).toBeInTheDocument();
    expect(screen.getByLabelText('Selected')).toBeInTheDocument();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('Top')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('changes radio selection and resets button state', () => {
    render(<DrawerSave tableId="table1" />);
    fireEvent.click(screen.getByLabelText('From'));
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Top'));
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('shows loading button after clicking create', async () => {
    render(<DrawerSave tableId="table1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { busy: true })).toBeInTheDocument(),
    );
  });

  it('renders screen reader status elements', async () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(() => Promise.resolve()),
      },
    });

    render(<DrawerSave tableId="table1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await screen.findByRole('button', { name: 'Copy' });
    expect(screen.getByText('Created: query123')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() =>
      expect(
        screen.getByText('https://example.com/query/query123'),
      ).toBeInTheDocument(),
    );
  });
});
