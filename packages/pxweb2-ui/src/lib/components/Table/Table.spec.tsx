import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

type VirtualRowMock = {
  className?: string;
  cells: React.ReactNode;
};

type TableVirtuosoMockProps = {
  data?: VirtualRowMock[];
  fixedHeaderContent?: () => React.ReactNode;
  itemContent: (index: number, item: VirtualRowMock) => React.ReactNode;
};

function getRowKey(item: VirtualRowMock, index: number): string {
  if (Array.isArray(item.cells)) {
    const elementKeys = item.cells
      .map((cell) => {
        if (typeof cell !== 'object' || cell === null) {
          return '';
        }
        if ('key' in cell) {
          return String((cell as React.ReactElement).key);
        }
        return '';
      })
      .join('-');
    if (elementKeys.length > 0) {
      return elementKeys;
    }
  }

  if (React.isValidElement(item.cells) && item.cells.key) {
    return String(item.cells.key);
  }

  if (item.className && item.className.length > 0) {
    return item.className + '-' + String(index);
  }

  return 'row-' + String(index);
}

vi.mock('react-virtuoso', () => ({
  TableVirtuoso: ({
    data = [],
    fixedHeaderContent,
    itemContent,
  }: TableVirtuosoMockProps) => (
    <table>
      <thead>{fixedHeaderContent?.()}</thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={getRowKey(item, index)}>{itemContent(index, item)}</tr>
        ))}
      </tbody>
    </table>
  ),
}));

import Table from './Table';
import { pxTable } from './testData';

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

  it('should have a th header named 1968', () => {
    const { baseElement } = render(
      <Table pxtable={pxTable} isMobile={false} />,
    );
    const ths = baseElement.querySelectorAll('th');
    let found = false;
    ths.forEach((th) => {
      if (th.innerHTML === '1968') {
        found = true;
      }
    });
    expect(found).toBe(true);
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
});
