import { memo, useEffect, useMemo, useRef, useState } from 'react';
import cl from 'clsx';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

import classes from './Table.module.scss';
import { DesktopVirtualizedTable } from './TableDesktopVirtualized';
import { MobileVirtualizedTable } from './TableMobileVirtualized';
import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { VartypeEnum } from '../../shared-types/vartypeEnum';

/** Public props for the table component that selects desktop/mobile rendering. */
export interface TableProps {
  readonly pxtable: PxTable;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
  readonly isMobile: boolean;
}

/** Props shared by virtualized table entry points. */
export interface VirtualizedTableProps extends Omit<TableProps, 'isMobile'> {}

/** Computed values and refs needed to render virtualized table variants. */
export interface BaseVirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly className?: string;
  readonly tableMeta: columnRowMeta;
  readonly tableColumnSize: number;
  readonly scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly verticalScrollElement: HTMLElement | null;
  readonly tableScrollMargin: number;
}

/** Inputs required by the generic virtualized table layout wrapper. */
export interface VirtualizedTableLayoutProps {
  readonly pxtable: PxTable;
  readonly className: string;
  readonly headingRows: React.JSX.Element[];
  readonly visibleBodyRows: React.JSX.Element[];
  readonly shouldVirtualize: boolean;
  readonly shouldVirtualizeColumns: boolean;
  readonly topPaddingHeight: number;
  readonly bottomPaddingHeight: number;
  readonly renderedColumnCount: number;
  readonly scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly verticalScrollElement: HTMLElement | null;
}

/**
 * Represents the metadata for one dimension of a data cell.
 */
interface DataCellMeta {
  varId: string; // id of variable
  valCode: string; // value code
  valLabel: string; // value label
  varPos: number; // variable position in stored data
  htmlId: string; // id used in th. Will build up the headers attribute for datacells. For accesability
}

/**
 * Represents the metadata for multiple dimensions of a data cell.
 */
interface DataCellCodes extends Array<DataCellMeta> {}

/** Horizontal column slice and matching virtual padding in pixels. */
interface VisibleColumnsWindow {
  visibleColumnStart: number; // Index of the first visible column
  visibleColumnEnd: number; // Index of the last visible column
  startPadding: number; // Start spacer pixel width for skipped columns
  endPadding: number; // End spacer pixel width for skipped columns
}

/** Vertical row slice and spacer heights for body virtualization. */
interface VisibleRowsWindow {
  visibleRowStart: number; // Index of the first visible row
  visibleRowEnd: number; // Index of the last visible row
  topPaddingHeight: number; // Top spacer height in pixels
  bottomPaddingHeight: number; // Bottom spacer height in pixels
}

/** Row window plus a flag indicating whether virtualization is active. */
interface VisibleRowsWindowResult extends VisibleRowsWindow {
  shouldVirtualize: boolean;
}

/** Minimal row item shape used from virtualizer results. */
interface VirtualRowItem {
  index: number; // Row index in the full dataset
  start: number; // Row start offset in pixels
  end: number; // Row end offset in pixels
}

export const DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD = 15;
const ROW_VIRTUALIZATION_THRESHOLD = 30;
const DESKTOP_ROW_ESTIMATE_SIZE = 44;
const MOBILE_ROW_ESTIMATE_SIZE = 44;
const DESKTOP_ROW_OVERSCAN = 12;
const MOBILE_ROW_OVERSCAN = 4;
// Bootstrap rows are a temporary first window used before the virtualizer has
// measured/returned concrete items. This avoids rendering an empty tbody frame.
const DESKTOP_BOOTSTRAP_ROW_COUNT = 24;
const MOBILE_BOOTSTRAP_ROW_COUNT = 12;
const HEADER_LINE_CHAR_THRESHOLD = 12; // Approximate character count per header line used to determine when to wrap header text.

/** Returns row virtualization sizing and overscan tuned for desktop/mobile. */
function getBodyRowVirtualizationSettings(isMobile: boolean) {
  return {
    estimateSize: isMobile
      ? MOBILE_ROW_ESTIMATE_SIZE
      : DESKTOP_ROW_ESTIMATE_SIZE,
    overscan: isMobile ? MOBILE_ROW_OVERSCAN : DESKTOP_ROW_OVERSCAN,
    bootstrapRowCount: isMobile
      ? MOBILE_BOOTSTRAP_ROW_COUNT
      : DESKTOP_BOOTSTRAP_ROW_COUNT,
  };
}

/** Combines a row window with its virtualization state flag. */
function createVisibleRowsWindowResult(
  shouldVirtualize: boolean,
  window: VisibleRowsWindow,
): VisibleRowsWindowResult {
  return {
    shouldVirtualize,
    ...window,
  };
}

/** Builds the full non-virtualized row window covering all rows. */
function createNonVirtualizedVisibleRowsWindow(
  rowCount: number,
): VisibleRowsWindow {
  return {
    visibleRowStart: 0,
    visibleRowEnd: rowCount,
    topPaddingHeight: 0,
    bottomPaddingHeight: 0,
  };
}

/** Builds an initial estimated row window before virtual items are available. */
function createBootstrapVisibleRowsWindow({
  rowCount,
  bootstrapRowCount,
  estimatedRowSize,
  totalSize,
}: {
  rowCount: number;
  bootstrapRowCount: number;
  estimatedRowSize: number;
  totalSize: number;
}): VisibleRowsWindow {
  // Render an initial estimated window from row 0 while waiting for a
  // non-empty virtualizer result.
  const visibleRowEnd = Math.min(rowCount, bootstrapRowCount);

  return {
    visibleRowStart: 0,
    visibleRowEnd,
    topPaddingHeight: 0,
    bottomPaddingHeight: Math.max(
      0,
      totalSize - visibleRowEnd * estimatedRowSize,
    ),
  };
}

/** Converts virtual row items into visible row bounds and padding heights. */
function createComputedVisibleRowsWindow({
  firstVirtualRow,
  lastVirtualRow,
  rowCount,
  tableScrollMargin,
  totalSize,
}: {
  firstVirtualRow: VirtualRowItem | undefined;
  lastVirtualRow: VirtualRowItem | undefined;
  rowCount: number;
  tableScrollMargin: number;
  totalSize: number;
}): VisibleRowsWindow {
  return {
    visibleRowStart: firstVirtualRow?.index ?? 0,
    visibleRowEnd: lastVirtualRow ? lastVirtualRow.index + 1 : rowCount,
    topPaddingHeight: firstVirtualRow
      ? Math.max(0, firstVirtualRow.start - tableScrollMargin)
      : 0,
    bottomPaddingHeight: lastVirtualRow ? totalSize - lastVirtualRow.end : 0,
  };
}

/** Chooses bootstrap/last/computed row window from current virtualizer output. */
function resolveVisibleRowsWindow({
  virtualRows,
  lastNonEmptyWindow,
  rowCount,
  tableScrollMargin,
  totalSize,
  bootstrapRowCount,
  estimatedRowSize,
}: {
  virtualRows: VirtualRowItem[];
  lastNonEmptyWindow: VisibleRowsWindow | null;
  rowCount: number;
  tableScrollMargin: number;
  totalSize: number;
  bootstrapRowCount: number;
  estimatedRowSize: number;
}): VisibleRowsWindow {
  if (virtualRows.length === 0) {
    if (lastNonEmptyWindow) {
      return lastNonEmptyWindow;
    }

    return createBootstrapVisibleRowsWindow({
      rowCount,
      bootstrapRowCount,
      estimatedRowSize,
      totalSize,
    });
  }

  return createComputedVisibleRowsWindow({
    firstVirtualRow: virtualRows[0],
    lastVirtualRow: virtualRows.at(-1),
    rowCount,
    tableScrollMargin,
    totalSize,
  });
}

/** Renders the mobile or desktop table variant based on viewport mode. */
export const Table = memo(function Table({
  pxtable,
  isMobile,
  getVerticalScrollElement,
  className = '',
}: TableProps) {
  if (isMobile) {
    return (
      <MobileVirtualizedTable
        pxtable={pxtable}
        getVerticalScrollElement={getVerticalScrollElement}
        className={className}
      />
    );
  }

  return (
    <DesktopVirtualizedTable
      pxtable={pxtable}
      getVerticalScrollElement={getVerticalScrollElement}
      className={className}
    />
  );
});

/** Computes shared table metadata, refs, and derived values for virtualized tables. */
export function useVirtualizedTableBaseProps({
  pxtable,
  getVerticalScrollElement,
  className = '',
}: VirtualizedTableProps): BaseVirtualizedTableProps {
  const { scrollContainerRef, verticalScrollElement, tableScrollMargin } =
    useTableScrollContext(getVerticalScrollElement);

  const tableMeta: columnRowMeta = useMemo(
    () => calculateRowAndColumnMeta(pxtable),
    [pxtable],
  );

  const tableColumnSize: number = tableMeta.columns - tableMeta.columnOffset;

  return {
    pxtable,
    tableMeta,
    tableColumnSize,
    scrollContainerRef,
    verticalScrollElement,
    tableScrollMargin,
    className,
  };
}

/**
 * Resolves which element drives vertical scrolling and computes the table
 * scroll margin used by virtualization when the table lives inside another
 * scroll container.
 */
function useTableScrollContext(
  getVerticalScrollElement?: () => HTMLElement | null,
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [verticalScrollElement, setVerticalScrollElement] =
    useState<HTMLElement | null>(null);
  const [tableScrollMargin, setTableScrollMargin] = useState(0);

  // Resolve the vertical scroll element
  useEffect(() => {
    // Use outer container scroll if it is provided, otherwise use the table container scroll
    let frameId: number | null = null;

    const updateVerticalScrollElement = () => {
      if (getVerticalScrollElement) {
        setVerticalScrollElement(getVerticalScrollElement());
      } else {
        setVerticalScrollElement(null);
      }
    };

    const scheduleUpdateVerticalScrollElement = () => {
      if (frameId !== null) {
        return;
      }

      frameId = requestAnimationFrame(() => {
        frameId = null;
        updateVerticalScrollElement();
      });
    };

    updateVerticalScrollElement();
    // Keep the resolved scroll element in sync with layout/viewport changes.
    globalThis.addEventListener('resize', scheduleUpdateVerticalScrollElement);

    return () => {
      globalThis.removeEventListener(
        'resize',
        scheduleUpdateVerticalScrollElement,
      );
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [getVerticalScrollElement]);

  // Update the table scroll margin used for virtualization when the scroll element or table geometry changes
  useEffect(() => {
    if (!verticalScrollElement || !scrollContainerRef.current) {
      setTableScrollMargin(0);
      return;
    }

    let frameId: number | null = null;

    const updateTableScrollMargin = () => {
      if (!scrollContainerRef.current) {
        return;
      }

      // Margin aligns virtualizer coordinates with the active scroll source.
      const tableTop = scrollContainerRef.current.getBoundingClientRect().top;
      const containerTop = verticalScrollElement.getBoundingClientRect().top;
      const margin = tableTop - containerTop + verticalScrollElement.scrollTop;

      setTableScrollMargin(Math.max(0, margin));
    };

    const scheduleUpdateTableScrollMargin = () => {
      if (frameId !== null) {
        return;
      }

      frameId = requestAnimationFrame(() => {
        frameId = null;
        updateTableScrollMargin();
      });
    };

    updateTableScrollMargin();
    // Recalculate on viewport changes.
    globalThis.addEventListener('resize', scheduleUpdateTableScrollMargin);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            scheduleUpdateTableScrollMargin();
          });

    if (resizeObserver && scrollContainerRef.current) {
      // Recalculate if table or scroll container geometry changes.
      resizeObserver.observe(scrollContainerRef.current);
      resizeObserver.observe(verticalScrollElement);
    }

    return () => {
      globalThis.removeEventListener('resize', scheduleUpdateTableScrollMargin);
      resizeObserver?.disconnect();
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [verticalScrollElement]);

  return { scrollContainerRef, verticalScrollElement, tableScrollMargin };
}

/** Prepares empty heading metadata slots for all rendered data columns. */
export function createHeadingDataCellCodes(
  table: PxTable,
  tableColumnSize: number,
): DataCellCodes[] {
  const headingDataCellCodes = new Array<DataCellCodes>(tableColumnSize);

  for (let i = 0; i < tableColumnSize; i++) {
    const dataCellCodes: DataCellCodes = new Array<DataCellMeta>(
      table.heading.length,
    );

    for (let j = 0; j < table.heading.length; j++) {
      dataCellCodes[j] = {
        varId: '',
        valCode: '',
        valLabel: '',
        varPos: 0,
        htmlId: '',
      };
    }
    headingDataCellCodes[i] = dataCellCodes;
  }

  return headingDataCellCodes;
}

/** Builds heading rows and aligned heading metadata in one call. */
export function createHeadingRowsAndDataCellCodes({
  table,
  tableMeta,
  tableColumnSize,
  columnWindow,
  nextKey,
}: {
  table: PxTable;
  tableMeta: columnRowMeta;
  tableColumnSize: number;
  columnWindow: {
    visibleColumnStart: number;
    visibleColumnEnd: number;
    startPadding: number;
    endPadding: number;
  };
  nextKey: () => string;
}): {
  headingRows: React.JSX.Element[];
  headingDataCellCodes: DataCellCodes[];
} {
  const headingDataCellCodes = createHeadingDataCellCodes(
    table,
    tableColumnSize,
  );
  const headingRows = createHeading(
    table,
    tableMeta,
    headingDataCellCodes,
    columnWindow,
    nextKey,
  );

  return { headingRows, headingDataCellCodes };
}

/** Creates a spacer table cell used for virtual start/end padding. */
export function createVirtualPaddingCell(
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

/** Computes the currently visible row window and spacer heights for virtualization. */
export function useBodyRowVirtualizationWindow({
  rowCount,
  isMobile,
  tableScrollMargin,
  verticalScrollElement,
  scrollContainerRef,
}: {
  rowCount: number;
  isMobile: boolean;
  tableScrollMargin: number;
  verticalScrollElement: HTMLElement | null;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const shouldVirtualize = rowCount > ROW_VIRTUALIZATION_THRESHOLD;
  const rowVirtualizationSettings = getBodyRowVirtualizationSettings(isMobile);

  const windowRowVirtualizer = useWindowVirtualizer({
    enabled: shouldVirtualize && verticalScrollElement !== null,
    count: rowCount,
    scrollMargin: tableScrollMargin,
    estimateSize: () => rowVirtualizationSettings.estimateSize,
    overscan: rowVirtualizationSettings.overscan,
  });

  const containerRowVirtualizer = useVirtualizer({
    enabled: shouldVirtualize && verticalScrollElement === null,
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    scrollMargin: tableScrollMargin,
    estimateSize: () => rowVirtualizationSettings.estimateSize,
    overscan: rowVirtualizationSettings.overscan,
  });

  const activeRowVirtualizer =
    verticalScrollElement === null
      ? containerRowVirtualizer
      : windowRowVirtualizer;

  const lastNonEmptyWindowRef = useRef<VisibleRowsWindow | null>(null);

  if (!shouldVirtualize) {
    return createVisibleRowsWindowResult(
      shouldVirtualize,
      createNonVirtualizedVisibleRowsWindow(rowCount),
    );
  }

  const virtualRows = activeRowVirtualizer.getVirtualItems();
  const totalSize = activeRowVirtualizer.getTotalSize();

  const resolvedWindow = resolveVisibleRowsWindow({
    virtualRows,
    lastNonEmptyWindow: lastNonEmptyWindowRef.current,
    rowCount,
    tableScrollMargin,
    totalSize,
    bootstrapRowCount: rowVirtualizationSettings.bootstrapRowCount,
    estimatedRowSize: rowVirtualizationSettings.estimateSize,
  });

  if (virtualRows.length > 0) {
    lastNonEmptyWindowRef.current = resolvedWindow;
  }

  return createVisibleRowsWindowResult(shouldVirtualize, resolvedWindow);
}

/** Renders the shared table shell with optional virtual top/bottom spacer rows. */
export function VirtualizedTableLayout({
  pxtable,
  className,
  headingRows,
  visibleBodyRows,
  shouldVirtualize,
  shouldVirtualizeColumns,
  topPaddingHeight,
  bottomPaddingHeight,
  renderedColumnCount,
  scrollContainerRef,
  verticalScrollElement,
}: VirtualizedTableLayoutProps) {
  const shouldUseInternalScrollContainer =
    shouldVirtualizeColumns ||
    (shouldVirtualize && verticalScrollElement === null);

  return (
    <div
      ref={scrollContainerRef}
      className={cl({
        [classes.virtualizedWrapper]: shouldUseInternalScrollContainer,
        [classes.virtualizedWrapperUseParentScroll]:
          shouldUseInternalScrollContainer && verticalScrollElement !== null,
      })}
    >
      <table
        className={cl(
          classes.table,
          classes[`bodyshort-medium`],
          {
            [classes.virtualizedTable]: shouldVirtualizeColumns,
          },
          className,
        )}
        aria-label={pxtable.metadata.label}
      >
        <thead>{headingRows}</thead>
        <tbody>
          {shouldVirtualize && topPaddingHeight > 0 && (
            <tr>
              <td
                colSpan={renderedColumnCount}
                className={classes.virtualPaddingCell}
                style={{ height: `${topPaddingHeight}px` }}
              />
            </tr>
          )}

          {visibleBodyRows}

          {shouldVirtualize && bottomPaddingHeight > 0 && (
            <tr>
              <td
                colSpan={renderedColumnCount}
                className={classes.virtualPaddingCell}
                style={{ height: `${bottomPaddingHeight}px` }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function writeHeadingCellMetadata({
  headingDataCellCodes,
  headingLevel,
  startColumnIndex,
  columnSpan,
  variableId,
  valueCode,
  variablePosition,
  htmlId,
}: {
  headingDataCellCodes: DataCellCodes[];
  headingLevel: number;
  startColumnIndex: number;
  columnSpan: number;
  variableId: string;
  valueCode: string;
  variablePosition: number;
  htmlId: string;
}): number {
  let columnIndex = startColumnIndex;

  for (let spanOffset = 0; spanOffset < columnSpan; spanOffset++) {
    headingDataCellCodes[columnIndex][headingLevel].varId = variableId;
    headingDataCellCodes[columnIndex][headingLevel].valCode = valueCode;
    headingDataCellCodes[columnIndex][headingLevel].varPos = variablePosition;
    headingDataCellCodes[columnIndex][headingLevel].htmlId = htmlId;
    columnIndex++;
  }

  return columnIndex;
}

function createVisibleHeadingCell({
  variable,
  headingLines,
  valueIndex,
  repetitionIndex,
  spanStart,
  spanEnd,
  columnWindow,
  hasStub,
  htmlId,
  nextKey,
}: {
  variable: PxTable['heading'][number];
  headingLines: number;
  valueIndex: number;
  repetitionIndex: number;
  spanStart: number;
  spanEnd: number;
  columnWindow: VisibleColumnsWindow;
  hasStub: boolean;
  htmlId: string;
  nextKey: () => string;
}): React.JSX.Element | null {
  const visibleSpanStart = Math.max(spanStart, columnWindow.visibleColumnStart);
  const visibleSpanEnd = Math.min(spanEnd, columnWindow.visibleColumnEnd);
  const visibleSpan = visibleSpanEnd - visibleSpanStart;

  if (visibleSpan <= 0) {
    return null;
  }

  return (
    <th
      id={htmlId}
      scope="col"
      colSpan={visibleSpan}
      key={nextKey()}
      aria-label={
        variable.type === VartypeEnum.TIME_VARIABLE
          ? `${variable.label} ${variable.values[valueIndex].label}`
          : undefined
      }
      className={cl({
        [classes.firstColNoStub]:
          valueIndex === 0 &&
          repetitionIndex === 1 &&
          !hasStub &&
          visibleSpanStart === 0,
        [classes.longHeaderCellText]: headingLines > 1,
      })}
    >
      <span
        className={classes.desktopHeaderLabelWrapper}
        style={
          {
            '--desktop-header-lines': headingLines,
          } as React.CSSProperties
        }
      >
        <span
          className={cl({
            [classes.longHeaderCellTextLabel]: headingLines > 1,
            [classes.longTextColumnSpan]: visibleSpan > 0,
          })}
          style={
            {
              '--desktop-header-colspan': visibleSpan,
            } as React.CSSProperties
          }
        >
          {variable.values[valueIndex].label}
        </span>
      </span>
    </th>
  );
}

function createHeadingRowForLevel({
  table,
  headingLevel,
  headingLines,
  repetitionsCurrentHeaderLevel,
  columnSpan,
  columnWindow,
  headingDataCellCodes,
  nextKey,
}: {
  table: PxTable;
  headingLevel: number;
  headingLines: number;
  repetitionsCurrentHeaderLevel: number;
  columnSpan: number;
  columnWindow: VisibleColumnsWindow;
  headingDataCellCodes: DataCellCodes[];
  nextKey: () => string;
}): React.JSX.Element[] {
  const headerRow: React.JSX.Element[] = [];
  const variable = table.heading[headingLevel];
  const variablePosition = table.data.variableOrder.indexOf(variable.id);
  let columnIndex = 0;

  if (columnWindow.startPadding > 0) {
    headerRow.push(
      createVirtualPaddingCell(columnWindow.startPadding, nextKey),
    );
  }

  for (
    let repetitionIndex = 1;
    repetitionIndex <= repetitionsCurrentHeaderLevel;
    repetitionIndex++
  ) {
    for (
      let valueIndex = 0;
      valueIndex < variable.values.length;
      valueIndex++
    ) {
      const value = variable.values[valueIndex];
      const spanStart = columnIndex;
      const spanEnd = columnIndex + columnSpan;
      const htmlId = `H${headingLevel}.${value.code}.I${repetitionIndex}`;

      const headingCell = createVisibleHeadingCell({
        variable,
        headingLines,
        valueIndex,
        repetitionIndex,
        spanStart,
        spanEnd,
        columnWindow,
        hasStub: table.stub.length > 0,
        htmlId,
        nextKey,
      });

      if (headingCell) {
        headerRow.push(headingCell);
      }

      columnIndex = writeHeadingCellMetadata({
        headingDataCellCodes,
        headingLevel,
        startColumnIndex: columnIndex,
        columnSpan,
        variableId: variable.id,
        valueCode: value.code,
        variablePosition,
        htmlId,
      });
    }
  }

  if (columnWindow.endPadding > 0) {
    headerRow.push(createVirtualPaddingCell(columnWindow.endPadding, nextKey));
  }

  return headerRow;
}

type HeadingLevelLayout = {
  headingLevel: number;
  headingLines: number;
  columnSpan: number;
  repetitionsCurrentHeaderLevel: number;
};

function calculateHeadingLevelLines(
  totalHeadingLevels: number,
  headingLevel: number,
  longestValueTextLength: number,
  totalColumnSpan: number,
): number {
  const weightedLength =
    totalColumnSpan > 4
      ? longestValueTextLength / (totalHeadingLevels - headingLevel)
      : longestValueTextLength;
  const lineChars =
    totalColumnSpan > 4
      ? HEADER_LINE_CHAR_THRESHOLD
      : HEADER_LINE_CHAR_THRESHOLD * 2;
  return Math.max(1, Math.ceil(weightedLength / lineChars));
}

function createHeadingLevelLayouts(
  table: PxTable,
  tableMeta: columnRowMeta,
): HeadingLevelLayout[] {
  const layouts: HeadingLevelLayout[] = [];
  let repetitionsCurrentHeaderLevel = 1;
  let columnSpan = tableMeta.columns - tableMeta.columnOffset;

  for (
    let headingLevel = 0;
    headingLevel < table.heading.length;
    headingLevel++
  ) {
    const valueCount = table.heading[headingLevel].values.length;
    const longestValueTextLength =
      tableMeta.longestValueTextByVariableId[table.heading[headingLevel].id] ||
      1;
    const headingLines = calculateHeadingLevelLines(
      table.heading.length,
      headingLevel,
      longestValueTextLength,
      columnSpan,
    );
    columnSpan /= valueCount;

    layouts.push({
      headingLevel,
      headingLines,
      columnSpan,
      repetitionsCurrentHeaderLevel,
    });

    repetitionsCurrentHeaderLevel *= valueCount;
  }

  return layouts;
}

/**
 * Creates the heading rows for the table.
 *
 * @param table - The PxTable object representing the table data.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param headingDataCellCodes - Empty metadata structure for the dimensions of the header cells.
 * @returns An array of React.JSX.Element representing the heading rows.
 */
export function createHeading(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes: DataCellCodes[],
  columnWindow: VisibleColumnsWindow,
  nextKey: () => string,
): React.JSX.Element[] {
  const headerRows: React.JSX.Element[] = [];
  const hasStub = table.stub.length > 0;
  const headingLevelLayouts = createHeadingLevelLayouts(table, tableMeta);
  const topLeftCell = hasStub ? (
    <td
      rowSpan={table.heading.length}
      className={classes.emptyTableData}
      key={nextKey()}
    >
      {''}
    </td>
  ) : null;

  for (const headingLevelLayout of headingLevelLayouts) {
    const headerRow = createHeadingRowForLevel({
      table,
      headingLevel: headingLevelLayout.headingLevel,
      headingLines: headingLevelLayout.headingLines,
      repetitionsCurrentHeaderLevel:
        headingLevelLayout.repetitionsCurrentHeaderLevel,
      columnSpan: headingLevelLayout.columnSpan,
      columnWindow,
      headingDataCellCodes,
      nextKey,
    });

    const rowCells =
      hasStub && headingLevelLayout.headingLevel === 0 && topLeftCell
        ? [topLeftCell, ...headerRow]
        : headerRow;

    headerRows.push(<tr key={nextKey()}>{rowCells}</tr>);
  }

  return headerRows;
}

/** Creates a monotonic key generator for deterministic render keys. */
export function createKeyFactory(): () => string {
  let counter = 0;

  return () => {
    counter += 1;
    return counter.toString();
  };
}
export default Table;
