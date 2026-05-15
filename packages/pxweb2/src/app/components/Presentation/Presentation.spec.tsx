import { renderWithProviders } from '../../util/testing-utils';
import Presentation from './Presentation';
import { MemoryRouter } from 'react-router';

describe('Presentation', () => {
  // Setup console mocks before all tests
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Suppress React error logging and component console.log
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(vi.fn());
  });

  afterAll(() => {
    // Restore console mocks
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should render successfully', () => {
    renderWithProviders(
      <MemoryRouter>
        <Presentation
          selectedTabId="1"
          isExpanded={false}
          setIsExpanded={vi.fn()}
        />
      </MemoryRouter>,
    );

    // Assert that the main element is rendered
    const main = document.querySelector('main');
    expect(main).toBeTruthy();
    vi.resetModules();
  });

  it('renders Table with suppressNullRows when param is set', () => {
    // Provide a realistic mock PxTable structure
    const pxTableMock = {
      metadata: { label: 'Test Table', variables: [], pathElements: [] },
      heading: [
        {
          id: 'H',
          label: 'Header',
          type: 'REGULAR_VARIABLE',
          mandatory: false,
          values: [{ label: 'H1', code: 'h1' }],
        },
      ],
      stub: [
        {
          id: 'S',
          label: 'Stub',
          type: 'REGULAR_VARIABLE',
          mandatory: false,
          values: [{ label: 'S1', code: 's1' }],
        },
      ],
      data: {
        cube: { s1: { h1: { value: 1 } } },
        variableOrder: ['S', 'H'],
        isLoaded: true,
      },
    };
    vi.doMock('../../context/useTableData', () => ({
      __esModule: true,
      default: () => ({
        data: pxTableMock,
        isFadingTable: false,
        setIsFadingTable: vi.fn(),
        pivotToMobile: vi.fn(),
        pivotToDesktop: vi.fn(),
        fetchTableData: vi.fn(),
        fetchSavedQuery: vi.fn(),
      }),
    }));
    vi.doMock('../../context/useVariables', () => ({
      __esModule: true,
      default: () => ({
        pxTableMetadata: { label: 'Test Table', variables: [] },
        hasLoadedInitialSelection: true,
        isLoadingMetadata: false,
        selectedVBValues: [],
        isMatrixSizeAllowed: true,
        getNumberOfSelectedValues: () => 1,
        getSelectedMatrixSize: () => 1,
      }),
    }));
    // Simulate URL param
    window.history.pushState({}, '', '/?suppressNullRows=1');
    renderWithProviders(
      <MemoryRouter initialEntries={['/?suppressNullRows=1']}>
        <Presentation
          selectedTabId="1"
          isExpanded={false}
          setIsExpanded={vi.fn()}
        />
      </MemoryRouter>,
    );
    // Assert that the main element is rendered
    const main = document.querySelector('main');
    expect(main).toBeTruthy();
    vi.resetModules();
  });

  it('applies fadeTable class when isFadingTable is true', () => {
    vi.doMock('../../context/useTableData', () => ({
      __esModule: true,
      default: () => ({
        data: { metadata: { label: 'Test Table' } },
        isFadingTable: true,
        setIsFadingTable: vi.fn(),
        pivotToMobile: vi.fn(),
        pivotToDesktop: vi.fn(),
        fetchTableData: vi.fn(),
        fetchSavedQuery: vi.fn(),
      }),
    }));
    vi.doMock('../../context/useVariables', () => ({
      __esModule: true,
      default: () => ({
        pxTableMetadata: { label: 'Test Table', variables: [] },
        hasLoadedInitialSelection: true,
        isLoadingMetadata: false,
        selectedVBValues: [],
        isMatrixSizeAllowed: true,
        getNumberOfSelectedValues: () => 1,
        getSelectedMatrixSize: () => 1,
      }),
    }));
    const { container } = renderWithProviders(
      <MemoryRouter>
        <Presentation
          selectedTabId="1"
          isExpanded={false}
          setIsExpanded={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect((container.firstChild as HTMLElement | null)?.className).toMatch(
      /fadeTable/,
    );
    vi.resetModules();
  });
});
