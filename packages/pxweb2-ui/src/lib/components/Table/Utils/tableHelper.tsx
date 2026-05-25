import { createElement, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import cl from 'clsx';
import classes from '../Table.module.scss';
import desktopClasses from '../DesktopVirtualizedTable/DesktopVirtualizedTable.module.scss';
import { PxTable } from '../../../shared-types/pxTable';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';

/** Props shared by virtualized table entry points. */
export interface VirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
}

/** Computed values and refs needed to render virtualized table variants. */
export interface BaseVirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly className?: string;
  readonly tableMeta: columnRowMeta;
  readonly tableColumnSize: number;
  readonly scrollContainerRef: RefObject<HTMLDivElement | null>;
  readonly verticalScrollElement: HTMLElement | null;
  readonly tableScrollMargin: number;
}

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

/** Vertical row slice and spacer heights for body virtualization. */
export interface VisibleRowsWindow {
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
export interface DataCellCodes extends Array<DataCellMeta> {}

const DESKTOP_ROW_ESTIMATE_SIZE = 44;
const MOBILE_ROW_ESTIMATE_SIZE = 44;
const DESKTOP_ROW_OVERSCAN = 15;
const MOBILE_ROW_OVERSCAN = 15;
const ROW_VIRTUALIZATION_THRESHOLD = 30;
const DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD = 4;
// Bootstrap rows are a temporary first window used before the virtualizer has
// measured/returned concrete items. This avoids rendering an empty tbody frame.
const DESKTOP_BOOTSTRAP_ROW_COUNT = 24;
const MOBILE_BOOTSTRAP_ROW_COUNT = 12;
const HEADER_LINE_CHAR_THRESHOLD = 12; // Approximate character count per header line used to determine when to wrap header text.
const HEADER_LINE_CHAR_THRESHOLD_LONG_TEXT = 16; // Approximate character per line when long texts.

/** Returns row virtualization sizing and overscan tuned for desktop/mobile. */
export function getBodyRowVirtualizationSettings(isMobile: boolean) {
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
export function createVisibleRowsWindowResult(
  shouldVirtualize: boolean,
  window: VisibleRowsWindow,
): VisibleRowsWindowResult {
  return {
    shouldVirtualize,
    ...window,
  };
}

/** Builds the full non-virtualized row window covering all rows. */
export function createNonVirtualizedVisibleRowsWindow(
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
export function resolveVisibleRowsWindow({
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

export function writeHeadingCellMetadata({
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

export type HeadingLevelLayout = {
  headingLevel: number;
  headingLines: number;
  columnSpan: number;
  repetitionsCurrentHeaderLevel: number;
};

export function createHeadingLevelLayouts(
  table: PxTable,
  tableMeta: columnRowMeta,
): HeadingLevelLayout[] {
  const layouts: HeadingLevelLayout[] = [];
  let repetitionsCurrentHeaderLevel = 1;
  const totalColumns = tableMeta.columns - tableMeta.columnOffset;
  let columnSpan = totalColumns;

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
      longestValueTextLength,
      columnSpan,
      valueCount,
      totalColumns,
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
 * Estimates how many wrapped lines a heading level needs.
 *
 * The estimate is based on:
 * - longestValueTextLength: longest label text at this heading level
 * - columnSpan/valueCount: effective width available per value
 * - text density thresholds tuned for normal vs long labels
 *
 * For very small tables (<= 2 columns), the threshold is relaxed because
 * each header cell typically has more horizontal space.
 */
export function calculateHeadingLevelLines(
  longestValueTextLength: number,
  columnSpan: number,
  valueCount: number,
  totalColumns: number,
): number {
  const charsPerLine =
    longestValueTextLength > 50
      ? HEADER_LINE_CHAR_THRESHOLD_LONG_TEXT
      : HEADER_LINE_CHAR_THRESHOLD;
  const columnsPerValue = columnSpan / valueCount;
  let effectiveCharThreshold = charsPerLine * columnsPerValue;

  if (totalColumns <= 2) {
    effectiveCharThreshold *= 2;
  }

  const returnValue = Math.ceil(
    longestValueTextLength / effectiveCharThreshold,
  );

  return returnValue;
}

/** Adds explicit line-break opportunities after forward slashes in labels. */
export function renderHeaderLabelWithSlashBreaks(label: string): ReactNode {
  if (!label.includes('/')) {
    return label;
  }

  let prefix = '';

  return label.split('/').flatMap((segment) => {
    prefix = prefix ? `${prefix}/${segment}` : segment;

    if (prefix.length === label.length) {
      return [segment];
    }

    return [segment, '/', createElement('wbr', { key: `wbr-${prefix}` })];
  });
}

/** Horizontal column slice and matching virtual padding in pixels. */
export interface VisibleColumnsWindow {
  visibleColumnStart: number; // Index of the first visible column
  visibleColumnEnd: number; // Index of the last visible column
  startPadding: number; // Start spacer pixel width for skipped columns
  endPadding: number; // End spacer pixel width for skipped columns
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
  columnWindow: VisibleColumnsWindow;
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
  position: 'start' | 'end' = 'start',
): React.JSX.Element {
  return (
    <td
      key={nextKey()}
      className={cl(desktopClasses.virtualColumnPaddingCell, {
        [desktopClasses.virtualColumnPaddingCellEnd]: position === 'end',
      })}
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
  scrollContainerRef: RefObject<HTMLDivElement | null>;
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
  totalColumns,
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
  totalColumns: number;
  nextKey: () => string;
}): React.JSX.Element | null {
  const visibleSpanStart = Math.max(spanStart, columnWindow.visibleColumnStart);
  const visibleSpanEnd = Math.min(spanEnd, columnWindow.visibleColumnEnd);
  const visibleSpan = visibleSpanEnd - visibleSpanStart;
  const fewColumns =
    totalColumns <= DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD;

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
        [desktopClasses.longHeaderCellText]: headingLines > 1,
        [desktopClasses.longTextColumnSpan]: visibleSpan > 0 && !fewColumns,
        [desktopClasses.longTextColumnSpanFewColumns]:
          visibleSpan > 0 && fewColumns,
      })}
      style={
        {
          '--desktop-header-colspan': visibleSpan,
        } as React.CSSProperties
      }
    >
      <span
        className={desktopClasses.desktopHeaderLabelWrapper}
        style={
          {
            '--desktop-header-lines': headingLines,
          } as React.CSSProperties
        }
      >
        <span
          className={cl({
            [desktopClasses.longHeaderCellTextLabel]: headingLines > 1,
          })}
        >
          {renderHeaderLabelWithSlashBreaks(variable.values[valueIndex].label)}
        </span>
      </span>
    </th>
  );
}

function createHeadingRowForLevel({
  table,
  headingLevelLayout,
  columnWindow,
  headingDataCellCodes,
  totalColumns,
  nextKey,
}: {
  table: PxTable;
  headingLevelLayout: HeadingLevelLayout;
  columnWindow: VisibleColumnsWindow;
  headingDataCellCodes: DataCellCodes[];
  totalColumns: number;
  nextKey: () => string;
}): React.JSX.Element[] {
  const headerRow: React.JSX.Element[] = [];
  const {
    headingLevel,
    headingLines,
    repetitionsCurrentHeaderLevel,
    columnSpan,
  } = headingLevelLayout;
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
        totalColumns,
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
    headerRow.push(
      createVirtualPaddingCell(columnWindow.endPadding, nextKey, 'end'),
    );
  }

  return headerRow;
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
      headingLevelLayout,
      columnWindow,
      headingDataCellCodes,
      nextKey,
      totalColumns: tableMeta.columns,
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
