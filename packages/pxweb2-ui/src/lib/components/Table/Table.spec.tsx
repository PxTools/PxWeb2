import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const childMocks = vi.hoisted(() => ({
  desktopRender: vi.fn(),
  mobileRender: vi.fn(),
}));

vi.mock('./TableDesktopVirtualized', () => ({
  DesktopVirtualizedTable: ({
    className,
    getVerticalScrollElement,
  }: {
    className?: string;
    getVerticalScrollElement?: () => HTMLElement | null;
  }) => {
    childMocks.desktopRender({ className, getVerticalScrollElement });
    return <div data-testid="desktop-virtualized-table" />;
  },
}));

vi.mock('./TableMobileVirtualized', () => ({
  MobileVirtualizedTable: ({
    className,
    getVerticalScrollElement,
  }: {
    className?: string;
    getVerticalScrollElement?: () => HTMLElement | null;
  }) => {
    childMocks.mobileRender({ className, getVerticalScrollElement });
    return <div data-testid="mobile-virtualized-table" />;
  },
}));

import Table from './Table';
import { pxTable } from './testData';

describe('Table', () => {
  beforeEach(() => {
    childMocks.desktopRender.mockClear();
    childMocks.mobileRender.mockClear();
  });

  it('renders desktop component when isMobile is false', () => {
    render(<Table pxtable={pxTable} isMobile={false} />);

    expect(screen.getByTestId('desktop-virtualized-table')).toBeTruthy();
    expect(screen.queryByTestId('mobile-virtualized-table')).toBeNull();
    expect(childMocks.desktopRender).toHaveBeenCalledTimes(1);
    expect(childMocks.mobileRender).not.toHaveBeenCalled();
  });

  it('renders mobile component when isMobile is true', () => {
    render(<Table pxtable={pxTable} isMobile={true} />);

    expect(screen.getByTestId('mobile-virtualized-table')).toBeTruthy();
    expect(screen.queryByTestId('desktop-virtualized-table')).toBeNull();
    expect(childMocks.mobileRender).toHaveBeenCalledTimes(1);
    expect(childMocks.desktopRender).not.toHaveBeenCalled();
  });

  it('forwards className and getVerticalScrollElement to desktop component', () => {
    const getVerticalScrollElement = vi.fn(() => null);

    render(
      <Table
        pxtable={pxTable}
        isMobile={false}
        className="custom-table-class"
        getVerticalScrollElement={getVerticalScrollElement}
      />,
    );

    expect(childMocks.desktopRender).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'custom-table-class',
        getVerticalScrollElement,
      }),
    );
  });

  it('forwards className and getVerticalScrollElement to mobile component', () => {
    const getVerticalScrollElement = vi.fn(() => null);

    render(
      <Table
        pxtable={pxTable}
        isMobile={true}
        className="mobile-table-class"
        getVerticalScrollElement={getVerticalScrollElement}
      />,
    );

    expect(childMocks.mobileRender).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'mobile-table-class',
        getVerticalScrollElement,
      }),
    );
  });
});
