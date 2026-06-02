import { createElement, type ReactNode } from 'react';
import cl from 'clsx';

import classes from '../Table.module.scss';
import desktopClasses from '../DesktopVirtualizedTable/DesktopVirtualizedTable.module.scss';
import { PxTable } from '../../../shared-types/pxTable';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import { columnRowMeta } from './columnRowMeta';

/** Horizontal column slice and matching virtual padding in pixels. */
interface VisibleColumnsWindow {
  visibleColumnStart: number; // Index of the first visible column
  visibleColumnEnd: number; // Index of the last visible column
  startPadding: number; // Start spacer pixel width for skipped columns
  endPadding: number; // End spacer pixel width for skipped columns
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

/**
 * Represents the layout of one heading level, used to compute the heading rows and aligned metadata.
 */
interface HeadingLevelLayout {
  headingLevel: number;
  headingLines: number;
  columnSpan: number;
  repetitionsCurrentHeaderLevel: number;
}

const DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD = 4;
const HEADER_LINE_CHAR_THRESHOLD = 12; // Approximate character count per header line used to determine when to wrap header text.
const HEADER_LINE_CHAR_THRESHOLD_LONG_TEXT = 16; // Approximate character per line when long texts.

/**
 * --- Table Helper Utilities used by clients ---
 */

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

/** Creates a monotonic key generator for deterministic render keys. */
export function createKeyFactory(): () => string {
  let counter = 0;

  return () => {
    counter += 1;
    return counter.toString();
  };
}

/**
 * --- Table Helper internal utilities ---
 */

/** Prepares empty heading metadata slots for all rendered data columns. */
function createHeadingDataCellCodes(
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

function createHeadingLevelLayouts(
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
function calculateHeadingLevelLines(
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
function renderHeaderLabelWithSlashBreaks(label: string): ReactNode {
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
function createHeading(
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
