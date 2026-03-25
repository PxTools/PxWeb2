import { useEffect, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cl from 'clsx';

import {
  VirtualizedTableProps,
  DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD,
  createHeading,
  createHeadingDataCellCodes,
  createKeyFactory,
  useBodyRowVirtualizationWindow,
  useVirtualizedTableBaseProps,
  VirtualizedTableLayout,
} from './Table';
import classes from './Table.module.scss';
import { getPxTableData } from './cubeHelper';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { Variable } from '../../shared-types/variable';

type StubCellMeta = {
  varPos: number;
  valCode: string;
  htmlId: string;
};

type DesktopRowEntry = {
  key: string;
  level: number;
  label: string;
  isDataRow: boolean;
  isFirstDimGroupRow: boolean;
  variable: Variable;
  stubCellCodes: StubCellMeta[];
};

type ColumnWindow = {
  start: number;
  end: number;
  leftPadding: number;
  rightPadding: number;
};

const HORIZONTAL_SCROLL_IDLE_DELAY_MS = 450;

function createPaddingCell(
  width: number,
  nextKey: () => string,
): React.JSX.Element {
  return (
    <td
      key={nextKey()}
      className={classes.virtualPaddingCell}
      style={{ width: `${width}px` }}
    />
  );
}

function buildDataCellMeta(
  stubCodes: StubCellMeta[],
  headingCodes: StubCellMeta[],
  cube: VirtualizedTableProps['pxtable']['data']['cube'],
): { headers: string; formattedValue: string | undefined } {
  const dataCodes = stubCodes.concat(headingCodes);
  const headers = dataCodes.map((cell) => cell.htmlId).join(' ');
  const dimensions: string[] = [];

  for (const cell of dataCodes) {
    dimensions[cell.varPos] = cell.valCode;
  }

  return {
    headers,
    formattedValue: getPxTableData(cube, dimensions)?.formattedValue,
  };
}

function renderNoStubBodyRows({
  columnWindow,
  headingDataCellCodes,
  cube,
}: {
  columnWindow: ColumnWindow;
  headingDataCellCodes: StubCellMeta[][];
  cube: VirtualizedTableProps['pxtable']['data']['cube'];
}): React.JSX.Element[] {
  const nextKey = createKeyFactory();
  const rowCells: React.JSX.Element[] = [];

  if (columnWindow.leftPadding > 0) {
    rowCells.push(createPaddingCell(columnWindow.leftPadding, nextKey));
  }

  for (
    let colIndex = columnWindow.start;
    colIndex < columnWindow.end;
    colIndex++
  ) {
    const headingCodes = headingDataCellCodes[colIndex];
    const headers = headingCodes.map((cell) => cell.htmlId).join(' ');
    const dimensions: string[] = [];

    for (const cell of headingCodes) {
      dimensions[cell.varPos] = cell.valCode;
    }

    const dataValue = getPxTableData(cube, dimensions);
    rowCells.push(
      <td key={nextKey()} headers={headers}>
        {dataValue?.formattedValue}
      </td>,
    );
  }

  if (columnWindow.rightPadding > 0) {
    rowCells.push(createPaddingCell(columnWindow.rightPadding, nextKey));
  }

  return [
    <tr key={nextKey()} className={classes.firstColNoStub}>
      {rowCells}
    </tr>,
  ];
}

function renderDesktopBodyRows({
  rows,
  columnWindow,
  headingDataCellCodes,
  cube,
}: {
  rows: DesktopRowEntry[];
  columnWindow: ColumnWindow;
  headingDataCellCodes: StubCellMeta[][];
  cube: VirtualizedTableProps['pxtable']['data']['cube'];
}): React.JSX.Element[] {
  const nextKey = createKeyFactory();
  const renderedRows: React.JSX.Element[] = [];

  for (const rowEntry of rows) {
    const rowCells: React.JSX.Element[] = [
      <th
        id={rowEntry.stubCellCodes[rowEntry.level]?.htmlId}
        scope="row"
        aria-label={
          rowEntry.variable.type === VartypeEnum.TIME_VARIABLE
            ? `${rowEntry.variable.label} ${rowEntry.label}`
            : undefined
        }
        className={cl(classes.stub, classes[`stub-${rowEntry.level}`])}
        key={nextKey()}
      >
        {rowEntry.label}
      </th>,
    ];

    if (columnWindow.leftPadding > 0) {
      rowCells.push(createPaddingCell(columnWindow.leftPadding, nextKey));
    }

    for (
      let colIndex = columnWindow.start;
      colIndex < columnWindow.end;
      colIndex++
    ) {
      if (!rowEntry.isDataRow) {
        rowCells.push(<td key={nextKey()} />);
        continue;
      }

      const headingCodes = headingDataCellCodes[colIndex];
      const dataMeta = buildDataCellMeta(
        rowEntry.stubCellCodes,
        headingCodes,
        cube,
      );

      rowCells.push(
        <td key={nextKey()} headers={dataMeta.headers}>
          {dataMeta.formattedValue}
        </td>,
      );
    }

    if (columnWindow.rightPadding > 0) {
      rowCells.push(createPaddingCell(columnWindow.rightPadding, nextKey));
    }

    renderedRows.push(
      <tr
        key={rowEntry.key}
        className={cl({ [classes.firstdim]: rowEntry.isFirstDimGroupRow })}
      >
        {rowCells}
      </tr>,
    );
  }

  return renderedRows;
}

function buildDesktopRowEntries(pxtable: VirtualizedTableProps['pxtable']) {
  if (pxtable.stub.length === 0) {
    return [] as DesktopRowEntry[];
  }

  const rowEntries: DesktopRowEntry[] = [];
  const lastStubLevel = pxtable.stub.length - 1;
  let stubIteration = 0;

  const walk = (level: number, stubCellCodes: StubCellMeta[]) => {
    const variable = pxtable.stub[level];

    for (const value of variable.values) {
      if (level === 0) {
        stubIteration++;
      }

      const nextStubCellCodes = stubCellCodes.slice(0, level);
      nextStubCellCodes[level] = {
        varPos: pxtable.data.variableOrder.indexOf(variable.id),
        valCode: value.code,
        htmlId: `R.${level}${value.code}.I${stubIteration}`,
      };

      rowEntries.push({
        key: `${level}:${value.code}:${stubIteration}:${rowEntries.length}`,
        level,
        label: value.label,
        isDataRow: level === lastStubLevel,
        isFirstDimGroupRow: level === 0 && pxtable.stub.length > 1,
        variable,
        stubCellCodes: nextStubCellCodes,
      });

      if (level < lastStubLevel) {
        walk(level + 1, nextStubCellCodes);
      }
    }
  };

  walk(0, []);
  return rowEntries;
}

export function DesktopVirtualizedTable({
  pxtable,
  getVerticalScrollElement,
  className = '',
}: VirtualizedTableProps) {
  const {
    tableMeta,
    tableColumnSize,
    scrollContainerRef,
    verticalScrollElement,
    tableScrollMargin,
  } = useVirtualizedTableBaseProps({
    pxtable,
    getVerticalScrollElement,
    className,
  });

  const shouldVirtualizeColumns =
    tableColumnSize > DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD;
  const headingRef = useRef<HTMLTableSectionElement>(null);
  const lastScrollLeftRef = useRef(0);
  const scrollIdleTimerRef = useRef<ReturnType<
    typeof globalThis.setTimeout
  > | null>(null);
  const captureLockFrameRef = useRef<number | null>(null);
  const isScrollingHorizontallyRef = useRef(false);
  const isPointerDraggingRef = useRef(false);
  const stableHeadingRowLocksRef = useRef<number[] | null>(null);
  const [isScrollingHorizontally, setIsScrollingHorizontally] = useState(false);
  const [headingRowLocks, setHeadingRowLocks] = useState<number[] | null>(null);

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    enabled: shouldVirtualizeColumns,
    count: tableColumnSize,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 88,
    overscan: 8,
  });

  const virtualColumns = shouldVirtualizeColumns
    ? columnVirtualizer.getVirtualItems()
    : [];
  const lastNonEmptyColumnWindowRef = useRef<{
    start: number;
    end: number;
    leftPadding: number;
    rightPadding: number;
  } | null>(null);
  const bootstrapColumnEnd = Math.min(tableColumnSize, 12);
  const bootstrapColumnWindow = useMemo(
    () => ({
      start: 0,
      end: bootstrapColumnEnd,
      leftPadding: 0,
      rightPadding: Math.max(
        0,
        columnVirtualizer.getTotalSize() - bootstrapColumnEnd * 88,
      ),
    }),
    [bootstrapColumnEnd, columnVirtualizer],
  );

  const columnWindow = (() => {
    if (!shouldVirtualizeColumns) {
      return {
        start: 0,
        end: tableColumnSize,
        leftPadding: 0,
        rightPadding: 0,
      };
    }

    if (virtualColumns.length === 0) {
      if (lastNonEmptyColumnWindowRef.current) {
        return lastNonEmptyColumnWindowRef.current;
      }

      return bootstrapColumnWindow;
    }

    const firstVirtualColumn = virtualColumns[0];
    const lastVirtualColumn = virtualColumns.at(-1);

    const window = {
      start: firstVirtualColumn?.index ?? 0,
      end: lastVirtualColumn ? lastVirtualColumn.index + 1 : tableColumnSize,
      leftPadding: firstVirtualColumn?.start ?? 0,
      rightPadding: lastVirtualColumn
        ? columnVirtualizer.getTotalSize() - lastVirtualColumn.end
        : 0,
    };

    lastNonEmptyColumnWindowRef.current = window;
    return window;
  })();

  const headingDataCellCodes = useMemo(
    () => createHeadingDataCellCodes(pxtable, tableColumnSize),
    [pxtable, tableColumnSize],
  );

  const headingRows = useMemo(
    () =>
      createHeading(
        pxtable,
        tableMeta,
        headingDataCellCodes,
        columnWindow,
        createKeyFactory(),
        headingRowLocks,
      ),
    [pxtable, tableMeta, headingDataCellCodes, columnWindow, headingRowLocks],
  );

  const desktopRowEntries = useMemo(
    () => buildDesktopRowEntries(pxtable),
    [pxtable],
  );

  const hasNoStub = pxtable.stub.length === 0;

  const rowCount = hasNoStub ? 1 : desktopRowEntries.length;

  const {
    shouldVirtualize,
    visibleRowStart,
    visibleRowEnd,
    topPaddingHeight,
    bottomPaddingHeight,
  } = useBodyRowVirtualizationWindow({
    rowCount,
    isMobile: false,
    tableScrollMargin,
    verticalScrollElement,
    scrollContainerRef,
  });

  const visibleDesktopRows = shouldVirtualize
    ? desktopRowEntries.slice(visibleRowStart, visibleRowEnd)
    : desktopRowEntries;

  const visibleBodyRows = useMemo(() => {
    if (hasNoStub) {
      return renderNoStubBodyRows({
        columnWindow,
        headingDataCellCodes,
        cube: pxtable.data.cube,
      });
    }

    return renderDesktopBodyRows({
      rows: visibleDesktopRows,
      columnWindow,
      headingDataCellCodes,
      cube: pxtable.data.cube,
    });
  }, [
    columnWindow,
    hasNoStub,
    headingDataCellCodes,
    pxtable.data.cube,
    visibleDesktopRows,
  ]);

  const renderedColumnCount =
    tableMeta.columnOffset +
    (columnWindow.end - columnWindow.start) +
    (columnWindow.leftPadding > 0 ? 1 : 0) +
    (columnWindow.rightPadding > 0 ? 1 : 0);

  const clearScrollIdleTimer = () => {
    if (scrollIdleTimerRef.current !== null) {
      globalThis.clearTimeout(scrollIdleTimerRef.current);
      scrollIdleTimerRef.current = null;
    }
  };

  const clearCaptureLockFrame = () => {
    if (captureLockFrameRef.current !== null) {
      cancelAnimationFrame(captureLockFrameRef.current);
      captureLockFrameRef.current = null;
    }
  };

  const captureCurrentHeaderRowHeights = () => {
    const headingElement = headingRef.current;
    if (!headingElement) {
      return null;
    }

    const rowElements = Array.from(headingElement.querySelectorAll('tr'));
    if (rowElements.length === 0) {
      return null;
    }

    const rowHeights = rowElements.map((rowElement) =>
      Math.ceil(rowElement.getBoundingClientRect().height),
    );

    if (rowHeights.some((height) => height <= 0)) {
      return null;
    }

    return rowHeights;
  };

  useEffect(() => {
    if (!shouldVirtualizeColumns || isScrollingHorizontally) {
      return;
    }

    const headingElement = headingRef.current;
    if (!headingElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    const captureStableRowLocks = () => {
      const rowHeights = captureCurrentHeaderRowHeights();
      if (rowHeights) {
        stableHeadingRowLocksRef.current = rowHeights;
      }
    };

    captureStableRowLocks();

    const resizeObserver = new ResizeObserver(() => {
      captureStableRowLocks();
    });

    resizeObserver.observe(headingElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [headingRows, isScrollingHorizontally, shouldVirtualizeColumns]);

  useEffect(() => {
    if (!shouldVirtualizeColumns) {
      clearScrollIdleTimer();
      clearCaptureLockFrame();
      stableHeadingRowLocksRef.current = null;
      isScrollingHorizontallyRef.current = false;
      isPointerDraggingRef.current = false;
      setIsScrollingHorizontally(false);
      setHeadingRowLocks(null);
      return;
    }

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) {
      return;
    }

    lastScrollLeftRef.current = scrollContainer.scrollLeft;

    const scheduleScrollIdleRelease = () => {
      clearScrollIdleTimer();
      scrollIdleTimerRef.current = globalThis.setTimeout(() => {
        if (isPointerDraggingRef.current) {
          scheduleScrollIdleRelease();
          return;
        }

        isScrollingHorizontallyRef.current = false;
        setIsScrollingHorizontally(false);
        setHeadingRowLocks(null);
        scrollIdleTimerRef.current = null;
      }, HORIZONTAL_SCROLL_IDLE_DELAY_MS);
    };

    const handlePointerDown = () => {
      isPointerDraggingRef.current = true;
    };

    const handlePointerUp = () => {
      isPointerDraggingRef.current = false;
      if (isScrollingHorizontallyRef.current) {
        scheduleScrollIdleRelease();
      }
    };

    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      if (scrollLeft === lastScrollLeftRef.current) {
        return;
      }

      lastScrollLeftRef.current = scrollLeft;

      if (!isScrollingHorizontallyRef.current) {
        const rowHeights = captureCurrentHeaderRowHeights();
        if (rowHeights) {
          isScrollingHorizontallyRef.current = true;
          setHeadingRowLocks(rowHeights);
          setIsScrollingHorizontally(true);
        } else {
          const stableRowHeights = stableHeadingRowLocksRef.current;
          if (stableRowHeights) {
            isScrollingHorizontallyRef.current = true;
            setHeadingRowLocks(stableRowHeights.slice());
            setIsScrollingHorizontally(true);
          } else {
            // If layout is still settling at scroll start, retry on the next frame.
            clearCaptureLockFrame();
            captureLockFrameRef.current = requestAnimationFrame(() => {
              captureLockFrameRef.current = null;
              const fallbackRowHeights = captureCurrentHeaderRowHeights();
              if (fallbackRowHeights) {
                isScrollingHorizontallyRef.current = true;
                setHeadingRowLocks(fallbackRowHeights);
                setIsScrollingHorizontally(true);
              }
            });
          }
        }
      }

      if (!isPointerDraggingRef.current) {
        scheduleScrollIdleRelease();
      }
    };

    scrollContainer.addEventListener('pointerdown', handlePointerDown, {
      passive: true,
    });
    globalThis.addEventListener('pointerup', handlePointerUp, {
      passive: true,
    });
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('pointerdown', handlePointerDown);
      globalThis.removeEventListener('pointerup', handlePointerUp);
      scrollContainer.removeEventListener('scroll', handleScroll);
      clearScrollIdleTimer();
      clearCaptureLockFrame();
      setHeadingRowLocks(null);
      isPointerDraggingRef.current = false;
    };
  }, [scrollContainerRef, shouldVirtualizeColumns]);

  const headingClassName = cl({
    [classes.tableHeadingLocked]:
      shouldVirtualizeColumns && headingRowLocks !== null,
    [classes.tableHeadingScrolling]:
      shouldVirtualizeColumns &&
      isScrollingHorizontally &&
      headingRowLocks !== null,
  });

  return (
    <VirtualizedTableLayout
      pxtable={pxtable}
      className={className}
      headingRows={headingRows}
      visibleBodyRows={visibleBodyRows}
      shouldVirtualize={shouldVirtualize}
      shouldVirtualizeColumns={shouldVirtualizeColumns}
      topPaddingHeight={topPaddingHeight}
      bottomPaddingHeight={bottomPaddingHeight}
      renderedColumnCount={renderedColumnCount}
      scrollContainerRef={scrollContainerRef}
      verticalScrollElement={verticalScrollElement}
      headingRef={headingRef}
      headingStyle={undefined}
      headingClassName={headingClassName}
    />
  );
}
