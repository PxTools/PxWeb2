import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router';

import Presentation from './Presentation';
import classes from './Presentation.module.scss';
import type { PxTable } from '@pxweb2/pxweb2-ui';

const { table, mockLineChart, mockBarChart, mockT } = vi.hoisted(() => ({
  table: {
    metadata: {
      id: '1',
      language: 'en',
      availableLanguages: ['en'],
      label: 'Test table',
      updated: new Date('2026-01-01'),
      source: '',
      infofile: '',
      decimals: 0,
      officialStatistics: false,
      aggregationAllowed: false,
      contents: '',
      descriptionDefault: false,
      matrix: '',
      subjectCode: '',
      subjectArea: '',
      variables: [],
      contacts: [],
      definitions: {},
      notes: [],
    },
    data: { cube: {}, variableOrder: [], isLoaded: true },
    stub: [],
    heading: [],
  } satisfies PxTable,
  mockLineChart: vi.fn(
    (props: { numberFormatter: (value: number) => string }) => {
      void props.numberFormatter;
      return null;
    },
  ),
  mockBarChart: vi.fn(
    (props: { numberFormatter: (value: number) => string }) => {
      void props.numberFormatter;
      return null;
    },
  ),
  mockT: vi.fn((key: string, options?: { value: string }) =>
    options ? `${key}:${options.value}` : key,
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT, i18n: { language: 'en' } }),
}));
vi.mock('../../util/config/getConfig', () => ({
  getConfig: () => ({ features: { chartEnabled: true } }),
}));

vi.mock('../../context/useApp', () => ({
  default: () => ({
    isMobile: false,
    screenSize: 'large',
    getSavedQueryId: () => '',
  }),
}));
vi.mock('../../context/useTableData', () => {
  const tableData = {
    data: table,
    isFadingTable: false,
    setIsFadingTable: vi.fn(),
    fetchTableData: vi.fn(),
    pivotToDesktop: vi.fn(),
    pivotToChart: vi.fn(),
    setChart: vi.fn(),
  };
  return { default: () => tableData };
});
vi.mock('../../context/useVariables', () => {
  const variables = {
    pxTableMetadata: table.metadata,
    selectedVBValues: [],
    hasLoadedInitialSelection: true,
    isLoadingMetadata: false,
    isMatrixSizeAllowed: true,
    getNumberOfSelectedValues: () => 0,
  };
  return { default: () => variables };
});
vi.mock('@uidotdev/usehooks', () => ({
  useDebounce: <T,>(value: T) => value,
}));
vi.mock('../ContentTop/ContentTop', () => ({
  ContentTop: () => null,
}));
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Table: () => <table aria-label="Test table" />,
  LineChart: mockLineChart,
  BarChart: mockBarChart,
  EmptyState: () => null,
  LocalAlert: () => null,
}));

type ScrollDimensions = {
  scrollWidth: number;
  clientWidth: number;
  scrollLeft: number;
};

function setScrollDimensions(
  element: HTMLDivElement,
  dimensions: ScrollDimensions,
) {
  Object.defineProperties(element, {
    scrollWidth: { configurable: true, value: dimensions.scrollWidth },
    clientWidth: { configurable: true, value: dimensions.clientWidth },
    scrollLeft: { configurable: true, value: dimensions.scrollLeft },
  });
}

function expectGradients(
  element: HTMLDivElement,
  leftHidden: boolean,
  rightHidden: boolean,
) {
  expect(element.classList.contains(classes.hidegradientLeft)).toBe(leftHidden);
  expect(element.classList.contains(classes.hidegradientRight)).toBe(
    rightHidden,
  );
}

function renderPresentation(
  dimensions: ScrollDimensions = {
    scrollWidth: 1000,
    clientWidth: 500,
    scrollLeft: 0,
  },
  initialEntry = '/',
) {
  // jsdom has no layout; provide dimensions before the mount effect runs.
  vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockReturnValue(
    dimensions.scrollWidth,
  );
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(
    dimensions.clientWidth,
  );
  vi.spyOn(HTMLElement.prototype, 'scrollLeft', 'get').mockReturnValue(
    dimensions.scrollLeft,
  );

  const result = render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Presentation
        selectedTabId="1"
        isExpanded={false}
        setIsExpanded={vi.fn()}
      />
    </MemoryRouter>,
  );
  const tableContainer = result.container.querySelector<HTMLDivElement>(
    `.${classes.tableContainer}`,
  );
  const gradientContainer = result.container.querySelector<HTMLDivElement>(
    `.${classes.gradientContainer}`,
  );

  if (!tableContainer || !gradientContainer) {
    throw new Error(
      'Presentation must render the table and gradient containers',
    );
  }

  if (initialEntry === '/') {
    expect(
      result.getByRole('table', { name: 'Test table' }),
    ).toBeInTheDocument();
  } else {
    expect(
      result.container.querySelector('table[aria-label="Test table"]'),
    ).toBeInTheDocument();
  }

  return { ...result, tableContainer, gradientContainer };
}

describe('Presentation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockLineChart.mockClear();
    mockBarChart.mockClear();
    mockT.mockClear();
  });

  it('renders the table and gradient containers', () => {
    const { tableContainer, gradientContainer } = renderPresentation();
    expect(tableContainer).toBeInTheDocument();
    expect(gradientContainer).toBeInTheDocument();
  });

  it.each([
    { view: 'linechart', chart: mockLineChart },
    { view: 'barchart', chart: mockBarChart },
  ])('passes translated number formatting to the $view', ({ view, chart }) => {
    renderPresentation(undefined, `/?view=${view}`);

    const chartProps = chart.mock.calls[0]?.[0];
    expect(chartProps).toBeDefined();
    if (!chartProps) {
      throw new Error('The selected chart was not rendered');
    }
    const numberFormatter = chartProps.numberFormatter;

    expect(numberFormatter(1234.5)).toBe('number.simple_number:1234.5');
    expect(mockT).toHaveBeenCalledWith('number.simple_number', {
      value: '1234.5',
    });
  });

  describe('Presentation gradient handling', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      {
        name: 'content narrower than container',
        scrollWidth: 400,
        scrollLeft: 0,
        leftHidden: true,
        rightHidden: true,
      },
      {
        name: 'content fitting exactly',
        scrollWidth: 500,
        scrollLeft: 0,
        leftHidden: true,
        rightHidden: true,
      },
      {
        name: 'overflow at the 3px tolerance',
        scrollWidth: 503,
        scrollLeft: 0,
        leftHidden: true,
        rightHidden: true,
      },
      {
        name: 'overflow just beyond the 3px tolerance',
        scrollWidth: 504,
        scrollLeft: 0,
        leftHidden: true,
        rightHidden: false,
      },
      {
        name: 'scrollable content at the start',
        scrollWidth: 1000,
        scrollLeft: 0,
        leftHidden: true,
        rightHidden: false,
      },
      {
        name: 'scrollable content in the middle',
        scrollWidth: 1000,
        scrollLeft: 250,
        leftHidden: false,
        rightHidden: false,
      },
      {
        name: 'just before the right-edge tolerance',
        scrollWidth: 1000,
        scrollLeft: 496,
        leftHidden: false,
        rightHidden: false,
      },
      {
        name: 'exactly at the right-edge tolerance',
        scrollWidth: 1000,
        scrollLeft: 497,
        leftHidden: false,
        rightHidden: true,
      },
      {
        name: 'fully scrolled to the right',
        scrollWidth: 1000,
        scrollLeft: 500,
        leftHidden: false,
        rightHidden: true,
      },
    ])(
      'initializes gradients for $name',
      ({ scrollWidth, scrollLeft, leftHidden, rightHidden }) => {
        const { gradientContainer } = renderPresentation({
          scrollWidth,
          clientWidth: 500,
          scrollLeft,
        });

        expectGradients(gradientContainer, leftHidden, rightHidden);
      },
    );

    it.each([
      { event: 'scroll', dispatch: fireEvent.scroll },
      { event: 'resize', dispatch: () => fireEvent.resize(window) },
    ])(
      'updates both gradients on $event through scrolling and fitting states',
      ({ dispatch }) => {
        const { tableContainer, gradientContainer } = renderPresentation();

        expectGradients(gradientContainer, true, false);

        for (const { scrollWidth, scrollLeft, leftHidden, rightHidden } of [
          {
            scrollWidth: 1000,
            scrollLeft: 250,
            leftHidden: false,
            rightHidden: false,
          },
          {
            scrollWidth: 1000,
            scrollLeft: 497,
            leftHidden: false,
            rightHidden: true,
          },
          {
            scrollWidth: 1000,
            scrollLeft: 250,
            leftHidden: false,
            rightHidden: false,
          },
          {
            scrollWidth: 1000,
            scrollLeft: 0,
            leftHidden: true,
            rightHidden: false,
          },
          {
            scrollWidth: 400,
            scrollLeft: 0,
            leftHidden: true,
            rightHidden: true,
          },
          {
            scrollWidth: 1000,
            scrollLeft: 0,
            leftHidden: true,
            rightHidden: false,
          },
        ]) {
          setScrollDimensions(tableContainer, {
            scrollWidth,
            clientWidth: 500,
            scrollLeft,
          });
          dispatch(tableContainer);

          expectGradients(gradientContainer, leftHidden, rightHidden);
        }
      },
    );
  });
});
