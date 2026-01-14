// import { describe, it, expect } from 'vitest';
// import {
//   render,
//   screen,
//   fireEvent,
//   waitFor,
//   within,
// } from '@testing-library/react';
// import '@testing-library/jest-dom/vitest';

// import { DrawerSave, fileFormats } from './DrawerSave';
// import * as exportUtil from '../../../util/export/exportUtil';
// import { OutputFormatType } from '@pxweb2/pxweb2-api-client';

// // Mock i18n
// vi.mock('react-i18next', () => ({
//   useTranslation: () => ({
//     t: (key: string, opts?: Record<string, unknown>) => {
//       // Save to file
//       if (key === 'presentation_page.side_menu.save.file.title') {
//         return 'Save to file';
//       }
//       if (key === 'presentation_page.side_menu.save.file.formats.excel') {
//         return 'Excel';
//       }
//       if (key === 'presentation_page.side_menu.save.file.formats.csv') {
//         return 'CSV';
//       }
//       if (key === 'presentation_page.side_menu.save.file.formats.px') {
//         return 'PX';
//       }
//       if (key === 'presentation_page.side_menu.save.file.formats.jsonstat2') {
//         return 'JSON-stat 2';
//       }
//       if (key === 'presentation_page.side_menu.save.file.formats.html') {
//         return 'HTML';
//       }
//       if (key === 'presentation_page.side_menu.save.file.formats.parquet') {
//         return 'Parquet';
//       }
//       if (
//         key === 'presentation_page.side_menu.save.file.loading_announcement'
//       ) {
//         return 'Export is taking longer than usual';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.title') {
//         return 'Save Query';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.info') {
//         return 'Save your query for later use.';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.radio_legend') {
//         return 'Period options';
//       }
//       if (
//         key ===
//         'presentation_page.side_menu.save.savequery.period_options.selected'
//       ) {
//         return 'Selected';
//       }
//       if (
//         key === 'presentation_page.side_menu.save.savequery.period_options.from'
//       ) {
//         return 'From';
//       }
//       if (
//         key === 'presentation_page.side_menu.save.savequery.period_options.top'
//       ) {
//         return 'Top';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.create_button') {
//         return 'Create';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.copy_button') {
//         return 'Copy';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.copied_button') {
//         return 'Copied';
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.copy_status') {
//         return `Copied: ${opts?.url}`;
//       }
//       if (key === 'presentation_page.side_menu.save.savequery.create_status') {
//         return `Created: ${opts?.query}`;
//       }
//       return key;
//     },
//     i18n: { language: 'en' },
//   }),
// }));

// // Mock context and export utils
// vi.mock('../../../context/useVariables', () => ({
//   default: () => ({
//     getUniqueIds: () => ['var1'],
//     getSelectedValuesByIdSorted: () => ['A', 'B'],
//     getSelectedCodelistById: () => undefined,
//   }),
// }));
// vi.mock('../../../context/useTableData', () => ({
//   default: () => ({
//     data: {
//       heading: [{ id: 'var1' }],
//       stub: [{ id: 'var2' }],
//       metadata: {
//         variables: [
//           { id: 'var1', type: 'TIME_VARIABLE' },
//           { id: 'var2', type: 'OTHER' },
//         ],
//       },
//     },
//   }),
// }));
// vi.mock('../../../util/export/exportUtil', () => ({
//   applyTimeFilter: (codes: string[]) => codes,
//   createNewSavedQuery: vi.fn(() => Promise.resolve('query123')),
//   createSavedQueryURL: (id: string) => `https://example.com/query/${id}`,
//   exportToFile: vi.fn(),
// }));

// describe('DrawerSave', () => {
//   it('renders without crashing', () => {
//     render(<DrawerSave tableId="table1" />);

//     expect(screen.getByText('Save Query')).toBeInTheDocument();
//   });

//   describe('Save to file', () => {
//     it('renders file format options', () => {
//       render(<DrawerSave tableId="table1" />);

//       // Scope to the file formats list by its accessible name (linked via aria-labelledby)
//       const list = screen.getByRole('list', { name: 'Save to file' });
//       const buttons = within(list).getAllByRole('button');
//       expect(buttons).toHaveLength(fileFormats.length);

//       // Check that each expected format is present by accessible name
//       const expectedNames = [
//         'Excel',
//         'CSV',
//         'PX',
//         'JSON-stat 2',
//         'HTML',
//         //'Parquet',
//       ];
//       expectedNames.forEach((name) => {
//         expect(within(list).getByRole('button', { name })).toBeInTheDocument();
//       });
//     });

//     it('clicking a format triggers export and shows loading state', async () => {
//       // Arrange deferred promise for export so we can observe loading state
//       const createDeferred = <T,>() => {
//         let resolve!: (value: T | PromiseLike<T>) => void;
//         const promise = new Promise<T>((res) => {
//           resolve = res;
//         });
//         return { promise, resolve };
//       };
//       const deferred = createDeferred<void>();
//       const mockExportToFile = vi.mocked(exportUtil).exportToFile;
//       mockExportToFile.mockImplementation(() => deferred.promise);

//       render(<DrawerSave tableId="table1" />);

//       const list = screen.getByRole('list', { name: 'Save to file' });
//       const excelBtn = within(list).getByRole('button', { name: 'Excel' });

//       // Act
//       fireEvent.click(excelBtn);

//       // Assert call args
//       expect(mockExportToFile).toHaveBeenCalledTimes(1);
//       expect(mockExportToFile).toHaveBeenCalledWith(
//         'table1',
//         'en',
//         expect.any(Object),
//         OutputFormatType.XLSX,
//       );

//       // Loading state while promise is pending
//       expect(excelBtn).toHaveAttribute('aria-busy', 'true');

//       // Resolve export and verify loading clears
//       deferred.resolve();
//       await waitFor(() => {
//         const reQueriedExcelBtn = within(list).getByRole('button', {
//           name: 'Excel',
//         });
//         expect(reQueriedExcelBtn).not.toHaveAttribute('aria-busy');
//       });
//     });

//     it('only the clicked format shows loading state', async () => {
//       const createDeferred = <T,>() => {
//         let resolve!: (value: T | PromiseLike<T>) => void;
//         const promise = new Promise<T>((res) => {
//           resolve = res;
//         });
//         return { promise, resolve };
//       };
//       const deferred = createDeferred<void>();
//       const mockExportToFile = vi.mocked(exportUtil).exportToFile;
//       mockExportToFile.mockImplementation(() => deferred.promise);

//       render(<DrawerSave tableId="table1" />);

//       const list = screen.getByRole('list', { name: 'Save to file' });
//       const excelBtn = within(list).getByRole('button', { name: 'Excel' });
//       const csvBtn = within(list).getByRole('button', { name: 'CSV' });

//       fireEvent.click(excelBtn);

//       expect(excelBtn).toHaveAttribute('aria-busy', 'true');
//       expect(csvBtn).not.toHaveAttribute('aria-busy');

//       deferred.resolve();
//       await waitFor(() => {
//         const reQueriedExcelBtn = within(list).getByRole('button', {
//           name: 'Excel',
//         });
//         expect(reQueriedExcelBtn).not.toHaveAttribute('aria-busy');
//       });
//     });
//   });

//   describe('Saved Query', () => {
//     it('renders info card, radio group, and create button', () => {
//       render(<DrawerSave tableId="table1" />);
//       expect(screen.getByText('Save Query')).toBeInTheDocument();
//       expect(
//         screen.getByText('Save your query for later use.'),
//       ).toBeInTheDocument();
//       expect(screen.getByText('Period options')).toBeInTheDocument();
//       expect(screen.getByLabelText('Selected')).toBeInTheDocument();
//       expect(screen.getByLabelText('From')).toBeInTheDocument();
//       expect(screen.getByLabelText('Top')).toBeInTheDocument();
//       expect(
//         screen.getByRole('button', { name: 'Create' }),
//       ).toBeInTheDocument();
//     });

//     it('changes radio selection and resets button state', () => {
//       render(<DrawerSave tableId="table1" />);
//       fireEvent.click(screen.getByLabelText('From'));
//       expect(
//         screen.getByRole('button', { name: 'Create' }),
//       ).toBeInTheDocument();
//       fireEvent.click(screen.getByLabelText('Top'));
//       expect(
//         screen.getByRole('button', { name: 'Create' }),
//       ).toBeInTheDocument();
//     });

//     it('shows loading button after clicking create', async () => {
//       render(<DrawerSave tableId="table1" />);
//       fireEvent.click(screen.getByRole('button', { name: 'Create' }));
//       await waitFor(() =>
//         expect(screen.getByRole('button', { busy: true })).toBeInTheDocument(),
//       );
//     });

//     it('renders screen reader status elements', async () => {
//       // Mock clipboard
//       Object.assign(navigator, {
//         clipboard: {
//           writeText: vi.fn(() => Promise.resolve()),
//         },
//       });

//       render(<DrawerSave tableId="table1" />);
//       fireEvent.click(screen.getByRole('button', { name: 'Create' }));
//       await screen.findByRole('button', { name: 'Copy' });
//       expect(screen.getByText('Created: query123')).toBeInTheDocument();
//       fireEvent.click(screen.getByRole('button', { name: 'Copy' }));
//       await waitFor(() =>
//         expect(
//           screen.getByText('https://example.com/query/query123'),
//         ).toBeInTheDocument(),
//       );
//     });
//   });
// });
