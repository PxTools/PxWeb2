import { memo, useRef } from 'react';
import cl from 'clsx';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

import classes from './Table.module.scss';
import desktopClasses from './DesktopVirtualizedTable/DesktopVirtualizedTable.module.scss';
import { DesktopVirtualizedTable } from './DesktopVirtualizedTable/DesktopVirtualizedTable';
import { MobileVirtualizedTable } from './MobileVirtualizedTable/MobileVirtualizedTable';
export { VirtualizedTableLayout } from './VirtualizedTableLayout/VirtualizedTableLayout';
export type { VirtualizedTableLayoutProps } from './VirtualizedTableLayout/VirtualizedTableLayout';
import { PxTable } from '../../shared-types/pxTable';
import { columnRowMeta } from './Utils/columnRowMeta';
import {
  createHeadingDataCellCodes,
  createHeadingLevelLayouts,
  createNonVirtualizedVisibleRowsWindow,
  createVisibleRowsWindowResult,
  DataCellCodes,
  getBodyRowVirtualizationSettings,
  HeadingLevelLayout,
  renderHeaderLabelWithSlashBreaks,
  resolveVisibleRowsWindow,
  VisibleRowsWindow,
  writeHeadingCellMetadata,
} from './Utils/tableHelper';
import { VartypeEnum } from '../../shared-types/vartypeEnum';

/** Public props for the table component that selects desktop/mobile rendering. */
export interface TableProps {
  readonly pxtable: PxTable;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
  readonly isMobile: boolean;
}

/** Horizontal column slice and matching virtual padding in pixels. */
interface VisibleColumnsWindow {
  visibleColumnStart: number; // Index of the first visible column
  visibleColumnEnd: number; // Index of the last visible column
  startPadding: number; // Start spacer pixel width for skipped columns
  endPadding: number; // End spacer pixel width for skipped columns
}

export const DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD = 15;
const ROW_VIRTUALIZATION_THRESHOLD = 30;
export const DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD = 4; // If there are few columns, we can allow more characters before wrapping, as there is more horizontal space available.

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

export default Table;
