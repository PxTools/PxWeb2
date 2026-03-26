import { memo, useEffect, useMemo, useRef, useState } from 'react';
import cl from 'clsx';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

import classes from './Table.module.scss';
import { DesktopVirtualizedTable } from './TableDesktopVirtualized';
import { MobileVirtualizedTable } from './TableMobileVirtualized';
import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { VartypeEnum } from '../../shared-types/vartypeEnum';

export interface TableProps {
  readonly pxtable: PxTable;
  readonly isMobile: boolean;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
}

export interface VirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
}

export interface BaseVirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly tableMeta: columnRowMeta;
  readonly tableColumnSize: number;
  readonly contentVarIndex: number;
  readonly contentsVariableDecimals?: Record<string, { decimals: number }>;
  readonly scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  readonly verticalScrollElement: HTMLElement | null;
  readonly tableScrollMargin: number;
  readonly className?: string;
}

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
type DataCellMeta = {
  varId: string; // id of variable
  valCode: string; // value code
  valLabel: string; // value label
  varPos: number; // variable position in stored data
  htmlId: string; // id used in th. Will build up the headers attribute for datacells. For accesability
};

/**
 * Represents the metadata for multiple dimensions of a data cell.
 */
type DataCellCodes = DataCellMeta[];

interface ColumnRenderWindow {
  start: number;
  end: number;
  startPadding: number;
  endPadding: number;
}

export const DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD = 15;
const ROW_VIRTUALIZATION_THRESHOLD = 30;
const DESKTOP_ROW_ESTIMATE_SIZE = 36;
const MOBILE_ROW_ESTIMATE_SIZE = 44;
const DESKTOP_ROW_OVERSCAN = 12;
const MOBILE_ROW_OVERSCAN = 4;
// Bootstrap rows are a temporary first window used before the virtualizer has
// measured/returned concrete items. This avoids rendering an empty tbody frame.
const DESKTOP_BOOTSTRAP_ROW_COUNT = 24;
const MOBILE_BOOTSTRAP_ROW_COUNT = 12;

type BodyRowWindow = {
  visibleRowStart: number;
  visibleRowEnd: number;
  topPaddingHeight: number;
  bottomPaddingHeight: number;
};

type BodyRowWindowResult = BodyRowWindow & {
  shouldVirtualize: boolean;
};

type VirtualRowItem = {
  index: number;
  start: number;
  end: number;
};

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

function createBodyRowWindowResult(
  shouldVirtualize: boolean,
  window: BodyRowWindow,
): BodyRowWindowResult {
  return {
    shouldVirtualize,
    ...window,
  };
}

function createNonVirtualizedBodyRowWindow(rowCount: number): BodyRowWindow {
  return {
    visibleRowStart: 0,
    visibleRowEnd: rowCount,
    topPaddingHeight: 0,
    bottomPaddingHeight: 0,
  };
}

function createBootstrapBodyRowWindow({
  rowCount,
  bootstrapRowCount,
  estimatedRowSize,
  totalSize,
}: {
  rowCount: number;
  bootstrapRowCount: number;
  estimatedRowSize: number;
  totalSize: number;
}): BodyRowWindow {
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

function createComputedBodyRowWindow({
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
}): BodyRowWindow {
  return {
    visibleRowStart: firstVirtualRow?.index ?? 0,
    visibleRowEnd: lastVirtualRow ? lastVirtualRow.index + 1 : rowCount,
    topPaddingHeight: firstVirtualRow
      ? Math.max(0, firstVirtualRow.start - tableScrollMargin)
      : 0,
    bottomPaddingHeight: lastVirtualRow ? totalSize - lastVirtualRow.end : 0,
  };
}

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

  const contentVarIndex = useMemo(() => {
    const contentsVariable = pxtable.metadata.variables.find(
      (variable) => variable.type === 'ContentsVariable',
    );

    if (!contentsVariable) {
      return -1;
    }

    return pxtable.data.variableOrder.indexOf(contentsVariable.id);
  }, [pxtable.data.variableOrder, pxtable.metadata.variables]);

  const contentsVariableDecimals = useMemo(
    () =>
      Object.fromEntries(
        pxtable.metadata.variables
          .filter((variable) => variable.type === 'ContentsVariable')
          .flatMap((variable) =>
            variable.values.map((value) => [
              value.code,
              { decimals: value.contentInfo?.decimals ?? 6 },
            ]),
          ),
      ),
    [pxtable.metadata.variables],
  );

  return {
    pxtable,
    tableMeta,
    tableColumnSize,
    contentVarIndex,
    contentsVariableDecimals,
    scrollContainerRef,
    verticalScrollElement,
    tableScrollMargin,
    className,
  };
}

function useTableScrollContext(
  getVerticalScrollElement?: () => HTMLElement | null,
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [verticalScrollElement, setVerticalScrollElement] =
    useState<HTMLElement | null>(null);
  const [tableScrollMargin, setTableScrollMargin] = useState(0);

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
    globalThis.addEventListener('resize', scheduleUpdateTableScrollMargin);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            scheduleUpdateTableScrollMargin();
          });

    if (resizeObserver && scrollContainerRef.current) {
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

  const lastNonEmptyWindowRef = useRef<BodyRowWindow | null>(null);

  if (!shouldVirtualize) {
    return createBodyRowWindowResult(
      shouldVirtualize,
      createNonVirtualizedBodyRowWindow(rowCount),
    );
  }

  const virtualRows = activeRowVirtualizer.getVirtualItems();
  const totalSize = activeRowVirtualizer.getTotalSize();

  if (virtualRows.length === 0) {
    // During warm-up the virtualizer can briefly return no items; prefer the
    // last stable window, otherwise fall back to the bootstrap window.
    if (lastNonEmptyWindowRef.current) {
      return createBodyRowWindowResult(
        shouldVirtualize,
        lastNonEmptyWindowRef.current,
      );
    }

    return createBodyRowWindowResult(
      shouldVirtualize,
      createBootstrapBodyRowWindow({
        rowCount,
        bootstrapRowCount: rowVirtualizationSettings.bootstrapRowCount,
        estimatedRowSize: rowVirtualizationSettings.estimateSize,
        totalSize,
      }),
    );
  }

  const computedWindow = createComputedBodyRowWindow({
    firstVirtualRow: virtualRows[0],
    lastVirtualRow: virtualRows.at(-1),
    rowCount,
    tableScrollMargin,
    totalSize,
  });

  lastNonEmptyWindowRef.current = computedWindow;

  return createBodyRowWindowResult(shouldVirtualize, computedWindow);
}

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
  columnWindow: ColumnRenderWindow,
  nextKey: () => string,
): React.JSX.Element[] {
  // Number of times to add all values for a variable, default to 1 for first header row
  let repetitionsCurrentHeaderLevel = 1;
  let columnSpan = 1;
  const emptyText = '';

  let headerRow: React.JSX.Element[] = [];
  const headerRows: React.JSX.Element[] = [];

  // If we have any variables in the stub create a empty cell at top left corner of the table
  if (table.stub.length > 0) {
    headerRow.push(
      <td
        rowSpan={table.heading.length}
        className={classes.emptyTableData}
        key={nextKey()}
      >
        {emptyText}
      </td>,
    );
  }
  // Otherwise calculate columnspan start value
  columnSpan = tableMeta.columns - tableMeta.columnOffset;

  // loop trough all the variables in the header. idxHeadingLevel is the header variable index
  for (
    let idxHeadingLevel = 0;
    idxHeadingLevel < table.heading.length;
    idxHeadingLevel++
  ) {
    if (columnWindow.startPadding > 0) {
      headerRow.push(
        <td
          key={nextKey()}
          className={classes.virtualPaddingCell}
          style={{ width: `${columnWindow.startPadding}px` }}
        />,
      );
    }

    // Set the column span for the header cells for the current row
    columnSpan = columnSpan / table.heading[idxHeadingLevel].values.length;
    const variable = table.heading[idxHeadingLevel];
    let columnIndex = 0;
    // Repeat for number of times in repetion, first time only once. idxRepetitionCurrentHeadingLevel is the repetition counter
    for (
      let idxRepetitionCurrentHeadingLevel = 1;
      idxRepetitionCurrentHeadingLevel <= repetitionsCurrentHeaderLevel;
      idxRepetitionCurrentHeadingLevel++
    ) {
      // loop trough all the values for the header variable
      for (let i = 0; i < variable.values.length; i++) {
        const spanStart = columnIndex;
        const spanEnd = columnIndex + columnSpan;
        const htmlId: string =
          'H' +
          idxHeadingLevel +
          '.' +
          variable.values[i].code +
          '.I' +
          idxRepetitionCurrentHeadingLevel;
        const visibleSpanStart = Math.max(spanStart, columnWindow.start);
        const visibleSpanEnd = Math.min(spanEnd, columnWindow.end);
        const visibleSpan = visibleSpanEnd - visibleSpanStart;

        if (visibleSpan > 0) {
          headerRow.push(
            <th
              id={htmlId}
              scope="col"
              colSpan={visibleSpan}
              key={nextKey()}
              aria-label={
                variable.type === VartypeEnum.TIME_VARIABLE
                  ? `${variable.label} ${variable.values[i].label}`
                  : undefined
              }
              className={cl({
                [classes.firstColNoStub]:
                  i === 0 &&
                  idxRepetitionCurrentHeadingLevel === 1 &&
                  table.stub.length === 0 &&
                  visibleSpanStart === 0,
              })}
            >
              {variable.values[i].label}
            </th>,
          );
        }

        // Repeat for the number of columns in the column span
        for (let j = 0; j < columnSpan; j++) {
          // Fill the metadata structure for the dimensions of the header cells
          headingDataCellCodes[columnIndex][idxHeadingLevel].varId =
            variable.id;
          headingDataCellCodes[columnIndex][idxHeadingLevel].valCode =
            variable.values[i].code;
          headingDataCellCodes[columnIndex][idxHeadingLevel].varPos =
            table.data.variableOrder.indexOf(variable.id);
          headingDataCellCodes[columnIndex][idxHeadingLevel].htmlId = htmlId;
          columnIndex++;
        }
      }
    }

    if (columnWindow.endPadding > 0) {
      headerRow.push(
        <td
          key={nextKey()}
          className={classes.virtualPaddingCell}
          style={{ width: `${columnWindow.endPadding}px` }}
        />,
      );
    }

    headerRows.push(<tr key={nextKey()}>{headerRow}</tr>);

    // Set repetiton for the next header variable
    repetitionsCurrentHeaderLevel *=
      table.heading[idxHeadingLevel].values.length;
    headerRow = [];
  }

  return headerRows;
}

export function createKeyFactory(): () => string {
  let counter = 0;

  return () => {
    counter += 1;
    return counter.toString();
  };
}
export default Table;
