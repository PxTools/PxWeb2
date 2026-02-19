import { render, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import Table, { shouldUseDesktopVirtualization } from './Table';
import { fakeData } from './cubeHelper';
import { pxTable } from './testData';
import { PxTable } from '../../shared-types/pxTable';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { Variable } from '../../shared-types/variable';

function createVirtualizedOrderTestTable(): PxTable {
  const stubDimOne: Variable = {
    id: 'Dimension1',
    label: 'Dimension1',
    type: VartypeEnum.REGULAR_VARIABLE,
    mandatory: false,
    values: [
      { code: 'x', label: 'x' },
      { code: 'y', label: 'y' },
    ],
  };

  const stubDimTwo: Variable = {
    id: 'Dimension2',
    label: 'Dimension2',
    type: VartypeEnum.REGULAR_VARIABLE,
    mandatory: false,
    values: [
      { code: 'a', label: 'a' },
      { code: 'b', label: 'b' },
    ],
  };

  const headingDim: Variable = {
    id: 'Heading',
    label: 'Heading',
    type: VartypeEnum.TIME_VARIABLE,
    mandatory: false,
    values: Array.from({ length: 200 }, (_, index) => {
      const value = `h${index + 1}`;
      return { code: value, label: value };
    }),
  };

  const variables = [stubDimOne, stubDimTwo, headingDim];

  const table: PxTable = {
    metadata: {
      id: 'order-test',
      label: 'Order test table',
      updated: new Date('2026-02-18T00:00:00.000Z'),
      variables,
      language: 'en',
      contacts: [],
      source: '',
      infofile: '',
      decimals: 0,
      officialStatistics: false,
      notes: [],
      matrix: '',
      subjectCode: '',
      subjectArea: '',
      aggregationAllowed: false,
      contents: '',
      descriptionDefault: false,
      definitions: {},
    },
    data: {
      cube: {},
      variableOrder: variables.map((variable) => variable.id),
      isLoaded: false,
    },
    heading: [headingDim],
    stub: [stubDimOne, stubDimTwo],
  };

  fakeData(table, [], 0, 0);
  table.data.isLoaded = true;

  return table;
}

function createVirtualizedMultiHeadingTestTable(): PxTable {
  const stubDim: Variable = {
    id: 'Stub',
    label: 'Stub',
    type: VartypeEnum.REGULAR_VARIABLE,
    mandatory: false,
    values: [
      { code: 's1', label: 's1' },
      { code: 's2', label: 's2' },
    ],
  };

  const headingDimOne: Variable = {
    id: 'Heading1',
    label: 'Heading1',
    type: VartypeEnum.REGULAR_VARIABLE,
    mandatory: false,
    values: [
      { code: 'h1a', label: 'h1a' },
      { code: 'h1b', label: 'h1b' },
      { code: 'h1c', label: 'h1c' },
    ],
  };

  const headingDimTwo: Variable = {
    id: 'Heading2',
    label: 'Heading2',
    type: VartypeEnum.TIME_VARIABLE,
    mandatory: false,
    values: [
      { code: '2024', label: '2024' },
      { code: '2025', label: '2025' },
    ],
  };

  const variables = [stubDim, headingDimOne, headingDimTwo];

  const table: PxTable = {
    metadata: {
      id: 'multi-heading-order-test',
      label: 'Multi heading order test table',
      updated: new Date('2026-02-18T00:00:00.000Z'),
      variables,
      language: 'en',
      contacts: [],
      source: '',
      infofile: '',
      decimals: 0,
      officialStatistics: false,
      notes: [],
      matrix: '',
      subjectCode: '',
      subjectArea: '',
      aggregationAllowed: false,
      contents: '',
      descriptionDefault: false,
      definitions: {},
    },
    data: {
      cube: {},
      variableOrder: variables.map((variable) => variable.id),
      isLoaded: false,
    },
    heading: [headingDimOne, headingDimTwo],
    stub: [stubDim],
  };

  fakeData(table, [], 0, 0);
  table.data.isLoaded = true;

  return table;
}

describe('Table', () => {
  it('should render successfully desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render successfully mobile', () => {
    const { baseElement } = render(<Table pxtable={pxTable} isMobile={true} />);
    expect(baseElement).toBeTruthy();
  });

  it('should render table headers on desktop', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    expect(ths.length).toBeGreaterThan(0);
  });

  it('should NOT have a th header named 1967', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1967') {
        found = true;
      }
    });
    expect(found).toBe(false);
  });

  it('should use virtualization only above threshold', () => {
    expect(shouldUseDesktopVirtualization(2, 4)).toBe(false);
    expect(shouldUseDesktopVirtualization(2, 5)).toBe(true);
  });

  it('should use virtualization for very large tables', () => {
    expect(shouldUseDesktopVirtualization(1000, 1000)).toBe(true);
  });

  it('should render grouped row header order for two stub dimensions', () => {
    const table = createVirtualizedOrderTestTable();
    const { baseElement } = render(<Table pxtable={table} isMobile={false} />);

    const rowHeaderTexts = Array.from(
      baseElement.querySelectorAll('tbody th[scope="row"]'),
    ).map((header) => header.textContent?.trim() ?? '');

    expect(rowHeaderTexts.slice(0, 6)).toEqual(['x', 'a', 'b', 'y', 'a', 'b']);
  });

  it('should render top-left virtualized header corner as td with correct rowSpan', () => {
    const table = createVirtualizedOrderTestTable();
    const { baseElement } = render(<Table pxtable={table} isMobile={false} />);

    const topLeftHeaderCell = baseElement.querySelector('thead tr td');

    expect(topLeftHeaderCell?.tagName).toBe('TD');
    expect(topLeftHeaderCell?.getAttribute('rowspan')).toBe(
      String(table.heading.length),
    );
  });

  it('should keep virtual header row heights stable across rerenders', async () => {
    const table = createVirtualizedMultiHeadingTestTable();
    const originalScrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollHeight',
    );

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        const cssHeight =
          (this as HTMLElement).style.height ||
          (this as HTMLElement).style.minHeight;
        const parsed = Number.parseFloat(cssHeight);
        return Number.isFinite(parsed) ? parsed : 44;
      },
    });

    try {
      const { baseElement, rerender } = render(
        <Table pxtable={table} isMobile={false} />,
      );

      const getHeaderRowHeight = () => {
        const row = baseElement.querySelector<HTMLTableRowElement>(
          'thead tr[data-virtual-header-row-index="0"]',
        );
        return Number.parseFloat(row?.style.height ?? '0');
      };

      await waitFor(() => {
        expect(getHeaderRowHeight()).toBe(44);
      });

      rerender(<Table pxtable={table} isMobile={false} />);

      await waitFor(() => {
        expect(getHeaderRowHeight()).toBe(44);
      });

      const cornerCell = baseElement.querySelector('thead tr td[rowspan="2"]');
      expect(cornerCell?.getAttribute('data-virtual-header-cell')).toBeNull();
    } finally {
      if (originalScrollHeight) {
        Object.defineProperty(
          HTMLElement.prototype,
          'scrollHeight',
          originalScrollHeight,
        );
      }
    }
  });

  it('should position virtual body rows using measured row heights', async () => {
    const table = createVirtualizedOrderTestTable();
    const originalScrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollHeight',
    );

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        const element = this as HTMLElement;

        if (
          element.matches(
            'tbody tr[data-virtual-row-index="0"] th[scope="row"]',
          )
        ) {
          return 80;
        }

        if (
          element.matches(
            'tbody tr[data-virtual-row-index="1"] th[scope="row"]',
          )
        ) {
          return 50;
        }

        const cssHeight = element.style.height || element.style.minHeight;
        const parsed = Number.parseFloat(cssHeight);
        return Number.isFinite(parsed) ? parsed : 36;
      },
    });

    try {
      const { baseElement } = render(
        <Table pxtable={table} isMobile={false} />,
      );

      const parseTranslateY = (value: string | undefined): number => {
        if (!value) {
          return Number.NaN;
        }

        const match = value.match(/translateY\(([-\d.]+)px\)/);
        return match ? Number.parseFloat(match[1]) : Number.NaN;
      };

      await waitFor(() => {
        const firstRow = baseElement.querySelector<HTMLTableRowElement>(
          'tbody tr[data-virtual-row-index="0"]',
        );
        const secondRow = baseElement.querySelector<HTMLTableRowElement>(
          'tbody tr[data-virtual-row-index="1"]',
        );

        expect(firstRow).toBeTruthy();
        expect(secondRow).toBeTruthy();
        expect(firstRow?.style.height).toBe('80px');
        expect(secondRow?.style.height).toBe('50px');

        const firstTranslateY = parseTranslateY(firstRow?.style.transform);
        const secondTranslateY = parseTranslateY(secondRow?.style.transform);

        expect(firstTranslateY).toBe(0);
        expect(secondTranslateY).toBe(80);
      });
    } finally {
      if (originalScrollHeight) {
        Object.defineProperty(
          HTMLElement.prototype,
          'scrollHeight',
          originalScrollHeight,
        );
      }
    }
  });

  it('should increase parent tbody row height when stub th is taller', async () => {
    const table = createVirtualizedOrderTestTable();
    const originalScrollHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'scrollHeight',
    );

    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get() {
        const element = this as HTMLElement;

        if (
          element.matches(
            'tbody tr[data-virtual-row-index="0"] th[scope="row"]',
          )
        ) {
          return 96;
        }

        const cssHeight = element.style.height || element.style.minHeight;
        const parsed = Number.parseFloat(cssHeight);
        return Number.isFinite(parsed) ? parsed : 36;
      },
    });

    try {
      const { baseElement } = render(
        <Table pxtable={table} isMobile={false} />,
      );

      await waitFor(() => {
        const firstRow = baseElement.querySelector<HTMLTableRowElement>(
          'tbody tr[data-virtual-row-index="0"]',
        );
        const firstStubHeader = baseElement.querySelector<HTMLElement>(
          'tbody tr[data-virtual-row-index="0"] th[scope="row"]',
        );

        expect(firstRow).toBeTruthy();
        expect(firstStubHeader).toBeTruthy();
        expect(firstRow?.style.height).toBe('96px');
        expect(firstStubHeader?.style.minHeight).toBe('96px');
      });
    } finally {
      if (originalScrollHeight) {
        Object.defineProperty(
          HTMLElement.prototype,
          'scrollHeight',
          originalScrollHeight,
        );
      }
    }
  });
});
