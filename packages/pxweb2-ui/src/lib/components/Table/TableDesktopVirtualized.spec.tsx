import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const virtualizerState = vi.hoisted(() => ({
  columnItems: [] as Array<{ index: number; start: number; end: number }>,
  columnTotalSize: 0,
  rowItems: [] as Array<{ index: number; start: number; end: number }>,
  rowTotalSize: 0,
  windowRowItems: [] as Array<{ index: number; start: number; end: number }>,
  windowRowTotalSize: 0,
}));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (options?: { horizontal?: boolean }) => {
    if (options?.horizontal) {
      return {
        getVirtualItems: () => virtualizerState.columnItems,
        getTotalSize: () => virtualizerState.columnTotalSize,
      };
    }

    return {
      getVirtualItems: () => virtualizerState.rowItems,
      getTotalSize: () => virtualizerState.rowTotalSize,
    };
  },
  useWindowVirtualizer: () => ({
    getVirtualItems: () => virtualizerState.windowRowItems,
    getTotalSize: () => virtualizerState.windowRowTotalSize,
  }),
}));

import classes from './Table.module.scss';
import { DesktopVirtualizedTable } from './TableDesktopVirtualized';
import { pxTable } from './testData';
import { PxTable } from '../../shared-types/pxTable';

function createVirtualItems(startIndex: number, count: number, size: number) {
  return Array.from({ length: count }, (_, offset) => {
    const index = startIndex + offset;
    const start = index * size;

    return {
      index,
      start,
      end: start + size,
    };
  });
}

function cloneTable(table: PxTable): PxTable {
  return structuredClone(table);
}

describe('TableDesktopVirtualized', () => {
  beforeEach(() => {
    virtualizerState.columnItems = createVirtualItems(0, 8, 88);
    virtualizerState.columnTotalSize = 16 * 88;
    virtualizerState.rowItems = createVirtualItems(0, 20, 36);
    virtualizerState.rowTotalSize = 50 * 36;
    virtualizerState.windowRowItems = [];
    virtualizerState.windowRowTotalSize = 0;
  });

  it('enables column virtualization when column count exceeds threshold', () => {
    const { container } = render(
      <DesktopVirtualizedTable pxtable={pxTable} className="desktop-table" />,
    );

    const table = container.querySelector('table');

    expect(table).toBeTruthy();
    expect(table?.classList.contains(classes.virtualizedTable)).toBe(true);
  });

  it('does not enable column virtualization at or below threshold', () => {
    const smallHeadingTable = cloneTable(pxTable);
    smallHeadingTable.heading[0].values =
      smallHeadingTable.heading[0].values.slice(0, 3);

    const { container } = render(
      <DesktopVirtualizedTable pxtable={smallHeadingTable} />,
    );

    const table = container.querySelector('table');

    expect(table).toBeTruthy();
    expect(table?.classList.contains(classes.virtualizedTable)).toBe(false);
  });

  it('uses bootstrap column window when virtualizer initially returns no columns', () => {
    virtualizerState.columnItems = [];
    virtualizerState.columnTotalSize = 16 * 88;
    virtualizerState.rowItems = createVirtualItems(49, 1, 36);

    const { container } = render(<DesktopVirtualizedTable pxtable={pxTable} />);

    const dataCell = container.querySelector('tbody td[headers]');

    expect(dataCell).toBeTruthy();
  });

  it('renders one body row in no-stub mode', () => {
    const noStubTable = cloneTable(pxTable);
    noStubTable.stub = [];

    const { container } = render(
      <DesktopVirtualizedTable pxtable={noStubTable} />,
    );

    const bodyRows = container.querySelectorAll('tbody tr');

    expect(bodyRows.length).toBe(1);
  });

  it('adds both stub and heading ids to desktop data cell headers', () => {
    virtualizerState.rowItems = createVirtualItems(49, 1, 36);

    const { container } = render(<DesktopVirtualizedTable pxtable={pxTable} />);

    const dataCell = container.querySelector('tbody td[headers]');
    const headers = dataCell?.getAttribute('headers') ?? '';

    expect(headers).toContain('R.');
    expect(headers).toContain('H0.');
  });

  it('sets aria-label for time variable row headers', () => {
    virtualizerState.rowItems = createVirtualItems(49, 1, 36);

    const { container } = render(<DesktopVirtualizedTable pxtable={pxTable} />);

    const timeRowHeader = container.querySelector(
      'tbody th[scope="row"][aria-label^="tid "]',
    );

    expect(timeRowHeader).toBeTruthy();
  });

  it('does not render row virtualization padding when row count is at or below threshold', () => {
    const smallRowTable = cloneTable(pxTable);
    smallRowTable.stub[0].values = smallRowTable.stub[0].values.slice(0, 1);
    smallRowTable.stub[1].values = smallRowTable.stub[1].values.slice(0, 1);
    smallRowTable.stub[2].values = smallRowTable.stub[2].values.slice(0, 1);

    const { container } = render(
      <DesktopVirtualizedTable pxtable={smallRowTable} />,
    );

    const paddingCells = container.querySelectorAll(
      'tbody td[style*="height"]',
    );

    expect(paddingCells.length).toBe(0);
  });
});
