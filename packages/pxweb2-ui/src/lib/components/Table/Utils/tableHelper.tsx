import { createElement } from 'react';
import type { ReactNode } from 'react';
import { PxTable } from '../../../shared-types/pxTable';
import { columnRowMeta } from './columnRowMeta';

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

/** Creates a monotonic key generator for deterministic render keys. */
export function createKeyFactory(): () => string {
  let counter = 0;

  return () => {
    counter += 1;
    return counter.toString();
  };
}
