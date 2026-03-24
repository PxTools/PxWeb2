import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const virtualizerState = vi.hoisted(() => ({
  rowItems: [] as Array<{ index: number; start: number; end: number }>,
  rowTotalSize: 0,
  windowRowItems: [] as Array<{ index: number; start: number; end: number }>,
  windowRowTotalSize: 0,
}));

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: () => ({
    getVirtualItems: () => virtualizerState.rowItems,
    getTotalSize: () => virtualizerState.rowTotalSize,
  }),
  useWindowVirtualizer: () => ({
    getVirtualItems: () => virtualizerState.windowRowItems,
    getTotalSize: () => virtualizerState.windowRowTotalSize,
  }),
}));

import classes from './Table.module.scss';
import { MobileVirtualizedTable } from './TableMobileVirtualized';
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

describe('TableMobileVirtualized', () => {
  beforeEach(() => {
    virtualizerState.rowItems = createVirtualItems(0, 40, 44);
    virtualizerState.rowTotalSize = 200 * 44;
    virtualizerState.windowRowItems = [];
    virtualizerState.windowRowTotalSize = 0;
  });

  it('includes second-last stub header id in mobile td headers', () => {
    const { container } = render(<MobileVirtualizedTable pxtable={pxTable} />);
    const firstDataCell = container.querySelector('tbody tr td[headers]');

    expect(firstDataCell).toBeTruthy();

    const headerTokens =
      firstDataCell?.getAttribute('headers')?.split(' ').filter(Boolean) ?? [];

    expect(headerTokens.some((token) => token.startsWith('Civilstatus_'))).toBe(
      true,
    );
    expect(headerTokens.some((token) => token.startsWith('Kon_'))).toBe(true);
    expect(headerTokens.some((token) => token.startsWith('TIME_'))).toBe(true);
    expect(headerTokens.some((token) => token.startsWith('H0.'))).toBe(true);
  });

  it('never enables desktop-style column virtualization class', () => {
    const { container } = render(<MobileVirtualizedTable pxtable={pxTable} />);
    const table = container.querySelector('table');

    expect(table).toBeTruthy();
    expect(table?.classList.contains(classes.virtualizedTable)).toBe(false);
  });

  it('renders one body row in no-stub mode', () => {
    const noStubTable = cloneTable(pxTable);
    noStubTable.stub = [];

    const { container } = render(
      <MobileVirtualizedTable pxtable={noStubTable} />,
    );

    const bodyRows = container.querySelectorAll('tbody tr');

    expect(bodyRows.length).toBe(1);
  });

  it('uses bootstrap row window when virtualizer initially returns no rows', () => {
    virtualizerState.rowItems = [];

    const { container } = render(<MobileVirtualizedTable pxtable={pxTable} />);

    const dataCell = container.querySelector('tbody td[headers]');

    expect(dataCell).toBeTruthy();
  });

  it('sets aria-label for time variable row headers', () => {
    const { container } = render(<MobileVirtualizedTable pxtable={pxTable} />);

    const timeRowHeader = container.querySelector(
      'tbody th[scope="row"][aria-label^="tid "]',
    );

    expect(timeRowHeader).toBeTruthy();
  });

  it('renders vertical padding rows when mobile row window starts after index 0', () => {
    virtualizerState.rowItems = createVirtualItems(10, 8, 44);

    const { container } = render(<MobileVirtualizedTable pxtable={pxTable} />);

    const paddingCells = container.querySelectorAll(
      'tbody td[style*="height"]',
    );

    expect(paddingCells.length).toBeGreaterThan(0);
  });

  it('does not render row virtualization padding when row count is at or below threshold', () => {
    const smallRowTable = cloneTable(pxTable);
    smallRowTable.stub[0].values = smallRowTable.stub[0].values.slice(0, 1);
    smallRowTable.stub[1].values = smallRowTable.stub[1].values.slice(0, 1);
    smallRowTable.stub[2].values = smallRowTable.stub[2].values.slice(0, 1);

    const { container } = render(
      <MobileVirtualizedTable pxtable={smallRowTable} />,
    );

    const paddingCells = container.querySelectorAll(
      'tbody td[style*="height"]',
    );

    expect(paddingCells.length).toBe(0);
  });
});
