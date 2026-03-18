import { memo, useEffect, useMemo, useRef, useState } from 'react';
import cl from 'clsx';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

import classes from './Table.module.scss';
import { DesktopVirtualizedTable } from './TableDesktopVirtualized';
import { MobileVirtualizedTable } from './TableMobileVirtualized';
import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { getPxTableData } from './cubeHelper';
import { Value } from '../../shared-types/value';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { Variable } from '../../shared-types/variable';

export interface TableProps {
  readonly pxtable: PxTable;
  readonly isMobile: boolean;
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

interface CreateRowParams {
  stubIndex: number;
  rowSpan: number;
  stubIteration: number;
  table: PxTable;
  tableMeta: columnRowMeta;
  columnWindow: ColumnRenderWindow;
  stubDataCellCodes: DataCellCodes;
  headingDataCellCodes: DataCellCodes[];
  tableRows: React.JSX.Element[];
  contentVarIndex: number;
  contentsVariableDecimals?: Record<string, { decimals: number }>;
  nextKey: () => string;
}
interface CreateRowMobileParams {
  stubIndex: number;
  rowSpan: number;
  table: PxTable;
  tableMeta: columnRowMeta;
  columnWindow: ColumnRenderWindow;
  stubDataCellCodes: DataCellCodes;
  headingDataCellCodes: DataCellCodes[];
  tableRows: React.JSX.Element[];
  uniqueIdCounter: { idCounter: number };
  contentVarIndex: number;
  contentsVariableDecimals?: Record<string, { decimals: number }>;
  nextKey: () => string;
  rowWindow?: RowWindow;
  rowCursor: { index: number };
}

interface CreateSecondLastMobileHeaderParams {
  stubLength: number;
  stubIndex: number;
  cellMeta: DataCellMeta;
  variable: Variable;
  val: Value;
  valueIndex: number;
  tableRows: React.JSX.Element[];
  uniqueIdCounter: { idCounter: number };
  nextKey: () => string;
  rowWindow?: RowWindow;
  rowCursor: { index: number };
}

interface CreateRepeatedMobileHeaderParams {
  table: PxTable;
  stubLength: number;
  stubIndex: number;
  stubDataCellCodes: DataCellCodes;
  tableRows: React.JSX.Element[];
  uniqueIdCounter: { idCounter: number };
  nextKey: () => string;
  rowWindow: RowWindow | undefined;
  rowCursor: { index: number };
}

/**
 * Represents the metadata for multiple dimensions of a data cell.
 */
type DataCellCodes = DataCellMeta[];

interface ColumnRenderWindow {
  start: number;
  end: number;
  leftPadding: number;
  rightPadding: number;
}

interface RowWindow {
  start: number;
  end: number;
}

export const DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD = 60;
const ROW_VIRTUALIZATION_THRESHOLD = 100;

export const Table = memo(function Table({
  pxtable,
  isMobile,
  getVerticalScrollElement,
  className = '',
}: TableProps) {
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

  const sharedProps: BaseVirtualizedTableProps = {
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

  if (isMobile) {
    return <MobileVirtualizedTable {...sharedProps} />;
  }

  return <DesktopVirtualizedTable {...sharedProps} />;
});

function useTableScrollContext(
  getVerticalScrollElement?: () => HTMLElement | null,
) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [verticalScrollElement, setVerticalScrollElement] =
    useState<HTMLElement | null>(null);
  const [tableScrollMargin, setTableScrollMargin] = useState(0);

  useEffect(() => {
    // Use outer container scroll if it is provided, otherwise use the table container scroll
    const updateVerticalScrollElement = () => {
      if (getVerticalScrollElement) {
        setVerticalScrollElement(getVerticalScrollElement());
      } else {
        setVerticalScrollElement(null);
      }
    };

    updateVerticalScrollElement();
    globalThis.addEventListener('resize', updateVerticalScrollElement);

    return () => {
      globalThis.removeEventListener('resize', updateVerticalScrollElement);
    };
  }, [getVerticalScrollElement]);

  useEffect(() => {
    if (!verticalScrollElement || !scrollContainerRef.current) {
      setTableScrollMargin(0);
      return;
    }

    const updateTableScrollMargin = () => {
      if (!scrollContainerRef.current) {
        return;
      }

      const tableTop = scrollContainerRef.current.getBoundingClientRect().top;
      const containerTop = verticalScrollElement.getBoundingClientRect().top;
      const margin = tableTop - containerTop + verticalScrollElement.scrollTop;

      setTableScrollMargin(Math.max(0, margin));
    };

    updateTableScrollMargin();
    globalThis.addEventListener('resize', updateTableScrollMargin);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            updateTableScrollMargin();
          });

    if (resizeObserver && scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
      resizeObserver.observe(verticalScrollElement);
    }

    return () => {
      globalThis.removeEventListener('resize', updateTableScrollMargin);
      resizeObserver?.disconnect();
    };
  }, [verticalScrollElement]);

  return { scrollContainerRef, verticalScrollElement, tableScrollMargin };
}

export function useTableRows({
  pxtable,
  tableMeta,
  tableColumnSize,
  columnWindow,
  isMobile,
  contentVarIndex,
  contentsVariableDecimals,
  rowWindow,
}: {
  pxtable: PxTable;
  tableMeta: columnRowMeta;
  tableColumnSize: number;
  columnWindow: ColumnRenderWindow;
  isMobile: boolean;
  contentVarIndex: number;
  contentsVariableDecimals?: Record<string, { decimals: number }>;
  rowWindow?: RowWindow;
}) {
  const { start, end, leftPadding, rightPadding } = columnWindow;

  return useMemo(() => {
    const nextKey = createKeyFactory();
    const headingDataCellCodes = createHeadingDataCellCodes(
      pxtable,
      tableColumnSize,
    );

    return {
      headingRows: createHeading(
        pxtable,
        tableMeta,
        headingDataCellCodes,
        columnWindow,
        nextKey,
      ),
      bodyRows: createRows(
        pxtable,
        tableMeta,
        headingDataCellCodes,
        columnWindow,
        isMobile,
        contentVarIndex,
        contentsVariableDecimals,
        nextKey,
        rowWindow,
      ),
    };
  }, [
    pxtable,
    tableMeta,
    tableColumnSize,
    start,
    end,
    leftPadding,
    rightPadding,
    isMobile,
    contentVarIndex,
    contentsVariableDecimals,
    rowWindow?.start,
    rowWindow?.end,
  ]);
}

function createInitialDataCellCodes(length: number): DataCellCodes {
  const codes: DataCellCodes = new Array<DataCellMeta>(length);

  for (let i = 0; i < length; i++) {
    codes[i] = {
      varId: '',
      valCode: '',
      valLabel: '',
      varPos: 0,
      htmlId: '',
    };
  }

  return codes;
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

export function calculateMobileBodyRowCount(table: PxTable): number {
  if (table.stub.length === 0) {
    return 1;
  }

  if (table.stub.length === 1) {
    return table.stub[0].values.length;
  }

  const stubLength = table.stub.length;
  const valueCounts = table.stub.map((stub) => stub.values.length);

  let rowsForCurrentLevel = valueCounts[stubLength - 1];

  for (let stubIndex = stubLength - 2; stubIndex >= 0; stubIndex--) {
    let rowOverheadPerValue = 0;
    if (stubIndex === stubLength - 2) {
      rowOverheadPerValue = 1;
    } else if (stubIndex === stubLength - 3) {
      rowOverheadPerValue = stubLength - 2;
    }

    rowsForCurrentLevel =
      valueCounts[stubIndex] * (rowOverheadPerValue + rowsForCurrentLevel);
  }

  return rowsForCurrentLevel;
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

  const windowRowVirtualizer = useWindowVirtualizer({
    enabled: shouldVirtualize && verticalScrollElement !== null,
    count: rowCount,
    scrollMargin: tableScrollMargin,
    estimateSize: () => (isMobile ? 44 : 36),
    overscan: isMobile ? 4 : 12,
  });

  const containerRowVirtualizer = useVirtualizer({
    enabled: shouldVirtualize && verticalScrollElement === null,
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    scrollMargin: tableScrollMargin,
    estimateSize: () => (isMobile ? 44 : 36),
    overscan: isMobile ? 4 : 12,
  });

  const rowVirtualizer =
    verticalScrollElement === null
      ? containerRowVirtualizer
      : windowRowVirtualizer;

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const firstVirtualRow = virtualRows[0];
  const lastVirtualRow = virtualRows.at(-1);
  const topPaddingHeight = firstVirtualRow
    ? Math.max(0, firstVirtualRow.start - tableScrollMargin)
    : 0;
  const bottomPaddingHeight = lastVirtualRow
    ? rowVirtualizer.getTotalSize() - lastVirtualRow.end
    : 0;
  const visibleRowStart = firstVirtualRow?.index ?? 0;
  const visibleRowEnd = lastVirtualRow ? lastVirtualRow.index + 1 : rowCount;

  if (!shouldVirtualize) {
    return {
      shouldVirtualize,
      visibleRowStart: 0,
      visibleRowEnd: rowCount,
      topPaddingHeight: 0,
      bottomPaddingHeight: 0,
    };
  }

  return {
    shouldVirtualize,
    visibleRowStart,
    visibleRowEnd,
    topPaddingHeight,
    bottomPaddingHeight,
  };
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
    if (columnWindow.leftPadding > 0) {
      headerRow.push(
        <td
          key={nextKey()}
          className={classes.virtualPaddingCell}
          style={{ width: `${columnWindow.leftPadding}px` }}
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

    if (columnWindow.rightPadding > 0) {
      headerRow.push(
        <td
          key={nextKey()}
          className={classes.virtualPaddingCell}
          style={{ width: `${columnWindow.rightPadding}px` }}
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

/**
 * Creates an array of React.JSX elements representing the rows of a table.
 * @param table The PxWeb table.
 * @param tableMeta Metadata of the table structure - rows and columns.
 * @param headingDataCellCodes  Metadata structure for the dimensions of the header cells.
 * @returns An array of React.JSX elements representing the rows of the table.
 */
export function createRows(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes: DataCellCodes[],
  columnWindow: ColumnRenderWindow,
  isMobile: boolean,
  contentVarIndex: number,
  contentsVariableDecimals?: Record<string, { decimals: number }>,
  nextKey?: () => string,
  rowWindow?: RowWindow,
): React.JSX.Element[] {
  const resolvedNextKey = nextKey ?? createKeyFactory();
  const tableRows: React.JSX.Element[] = [];
  if (table.stub.length > 0) {
    if (isMobile) {
      const mobileStubDatacellCodes = createInitialDataCellCodes(
        table.stub.length,
      );

      createRowMobile({
        stubIndex: 0,
        rowSpan: tableMeta.rows - tableMeta.rowOffset,
        table,
        tableMeta,
        columnWindow,
        stubDataCellCodes: mobileStubDatacellCodes,
        headingDataCellCodes,
        tableRows,
        uniqueIdCounter: { idCounter: 0 },
        contentsVariableDecimals,
        contentVarIndex,
        nextKey: resolvedNextKey,
        rowWindow,
        rowCursor: { index: 0 },
      });
    } else {
      const desktopStubDatacellCodes: DataCellCodes = [];

      createRowDesktop({
        stubIndex: 0,
        rowSpan: tableMeta.rows - tableMeta.rowOffset,
        stubIteration: 0,
        table,
        tableMeta,
        columnWindow,
        stubDataCellCodes: desktopStubDatacellCodes,
        headingDataCellCodes,
        tableRows,
        contentsVariableDecimals,
        contentVarIndex,
        nextKey: resolvedNextKey,
      });
    }
  } else {
    const noStubDataCellCodes: DataCellCodes = [];
    const tableRow: React.JSX.Element[] = [];
    fillData(
      table,
      columnWindow,
      noStubDataCellCodes,
      headingDataCellCodes,
      tableRow,
      resolvedNextKey,
    );
    tableRows.push(
      <tr key={resolvedNextKey()} className={cl(classes.firstColNoStub)}>
        {tableRow}
      </tr>,
    );
  }

  return tableRows;
}

/**
 * Creates the rows for the table based on the stub variables. For desktop devices.
 *
 * @param stubIndex - The index of the current stub variable.
 * @param rowSpan - The rowspan for the cells to add in this call.
 * @param stubIteration - Iteration for the value
 * @param table - The PxTable object representing the PxWeb table data.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param stubDataCellCodes - The metadata structure for the dimensions of the stub cells.
 * @param headingDataCellCodes - The metadata structure for the dimensions of the header cells.
 * @param tableRows - An array of React.JSX.Element representing the rows of the table.
 * @param contentsVarIndex - The index of the contents variable in the variable order.
 * @param contentsVariableDecimals - The metadata structure for the contents variable decimals.
 * @returns An array of React.JSX.Element representing the rows of the table.
 */
function createRowDesktop({
  stubIndex,
  rowSpan,
  stubIteration,
  table,
  tableMeta,
  columnWindow,
  stubDataCellCodes,
  headingDataCellCodes,
  tableRows,
  contentVarIndex,
  contentsVariableDecimals,
  nextKey,
}: CreateRowParams): React.JSX.Element[] {
  // Calculate the rowspan for all the cells to add in this call
  rowSpan = rowSpan / table.stub[stubIndex].values.length;

  let tableRow: React.JSX.Element[] = [];

  const variable = table.stub[stubIndex];

  // Loop through all the values in the stub variable
  for (const val of table.stub[stubIndex].values) {
    if (stubIndex === 0) {
      stubIteration++;
    }

    const cellMeta: DataCellMeta = {
      varId: variable.id,
      valCode: val.code,
      valLabel: val.label,
      varPos: table.data.variableOrder.indexOf(variable.id),
      htmlId: 'R.' + stubIndex + val.code + '.I' + stubIteration,
    };
    stubDataCellCodes.push(cellMeta);
    // Fix the rowspan
    if (rowSpan === 0) {
      rowSpan = 1;
    }

    tableRow.push(
      <th
        id={cellMeta.htmlId}
        scope="row"
        aria-label={
          variable.type === VartypeEnum.TIME_VARIABLE
            ? `${variable.label} ${val.label}`
            : undefined
        }
        className={cl(classes.stub, classes[`stub-${stubIndex}`])}
        key={nextKey()}
      >
        {val.label}
      </th>,
    );

    // If there are more stub variables that need to add headers to this row
    if (table.stub.length > stubIndex + 1) {
      // make the rest of this row empty
      fillEmpty(tableRow, columnWindow, nextKey);
      tableRows.push(
        <tr
          className={cl({ [classes.firstdim]: stubIndex === 0 })}
          key={nextKey()}
        >
          {tableRow}
        </tr>,
      );
      tableRow = [];

      // Create a new row for the next stub
      createRowDesktop({
        stubIndex: stubIndex + 1,
        rowSpan,
        stubIteration,
        table,
        tableMeta,
        columnWindow,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRows,
        contentVarIndex,
        contentsVariableDecimals,
        nextKey,
      });
      stubDataCellCodes.pop();
    } else {
      // If no more stubs need to add headers then fill the row with data
      fillData(
        table,
        columnWindow,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRow,
        nextKey,
      );
      tableRows.push(<tr key={nextKey()}>{tableRow}</tr>);
      tableRow = [];
      stubDataCellCodes.pop();
    }
  }

  return tableRows;
}

/**
 * Creates the rows for the table based on the stub variables. For mobile devices
 *
 * @param stubIndex - The index of the current stub variable.
 * @param rowSpan - The rowspan for the cells to add in this call.
 * @param stubIteration - Iteration for the value
 * @param table - The PxTable object representing the PxWeb table data.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param stubDataCellCodes - The metadata structure for the dimensions of the stub cells.
 * @param headingDataCellCodes - The metadata structure for the dimensions of the header cells.
 * @param tableRows - An array of React.JSX.Element representing the rows of the table.
 * @param contentsVarIndex - The index of the contents variable in the variable order.
 * @param contentsVariableDecimals - The metadata structure for the contents variable decimals.
 * @returns An array of React.JSX.Element representing the rows of the table.
 */
function createRowMobile({
  stubIndex,
  rowSpan,
  table,
  tableMeta,
  columnWindow,
  stubDataCellCodes,
  headingDataCellCodes,
  tableRows,
  uniqueIdCounter,
  contentVarIndex,
  contentsVariableDecimals,
  nextKey,
  rowWindow,
  rowCursor,
}: CreateRowMobileParams): React.JSX.Element[] {
  const stubValuesLength = table.stub[stubIndex].values.length;
  const stubLength = table.stub.length;
  // Calculate the rowspan for all the cells to add in this call
  rowSpan = rowSpan / stubValuesLength;

  let tableRow: React.JSX.Element[] = [];

  // Loop through all the values in the stub variable
  //const stubValuesLength = table.stub[stubIndex].values.length;
  for (let i = 0; i < stubValuesLength; i++) {
    const variable = table.stub[stubIndex];
    uniqueIdCounter.idCounter++;
    const val = table.stub[stubIndex].values[i];
    const cellMeta: DataCellMeta = {
      varId: table.stub[stubIndex].id,
      valCode: val.code,
      valLabel: val.label,
      varPos: table.data.variableOrder.indexOf(table.stub[stubIndex].id),
      htmlId: '',
    };
    stubDataCellCodes[stubIndex] = cellMeta;
    // Fix the rowspan
    if (rowSpan === 0) {
      rowSpan = 1;
    }
    let lastValueOfLastStub = false;
    if (stubIndex === stubLength - 1 && i === stubValuesLength - 1) {
      // the last value of last level stub
      lastValueOfLastStub = true;
    }
    // If there are more stub variables that need to add headers to this row
    if (stubLength > stubIndex + 1) {
      switch (stubIndex) {
        case stubLength - 3: {
          // third last level
          // Repeat the headers for all stubs except the 2 last levels
          createRepeatedMobileHeader({
            table,
            stubLength,
            stubIndex,
            stubDataCellCodes,
            tableRows,
            uniqueIdCounter,
            nextKey,
            rowWindow,
            rowCursor,
          });
          break;
        }
        case stubLength - 2: {
          // second last level
          createSecondLastMobileHeader({
            stubLength,
            stubIndex,
            cellMeta,
            variable,
            val,
            valueIndex: i,
            tableRows,
            uniqueIdCounter,
            nextKey,
            rowWindow,
            rowCursor,
          });
          break;
        }
      }
      // Create a new row for the next stub
      createRowMobile({
        stubIndex: stubIndex + 1,
        rowSpan,
        table,
        tableMeta,
        columnWindow,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRows,
        uniqueIdCounter,
        contentVarIndex,
        contentsVariableDecimals,
        nextKey,
        rowWindow,
        rowCursor,
      });
    } else {
      // last level
      let tempid =
        cellMeta.varId +
        '_' +
        cellMeta.valCode +
        '_I' +
        uniqueIdCounter.idCounter;
      cellMeta.htmlId = tempid;
      if (isRowVisible(rowCursor, rowWindow)) {
        tableRow.push(
          <th
            id={cellMeta.htmlId}
            scope="row"
            aria-label={
              variable.type === VartypeEnum.TIME_VARIABLE
                ? `${variable.label} ${val.label}`
                : undefined
            }
            className={cl(classes.stub, classes[`stub-${stubIndex}`])}
            key={nextKey()}
          >
            {val.label}
          </th>,
        );
        fillData(
          table,
          columnWindow,
          stubDataCellCodes,
          headingDataCellCodes,
          tableRow,
          nextKey,
        );
        tableRows.push(
          <tr
            key={nextKey()}
            className={cl(
              classes.mobileRowHeadLastStub,
              {
                [classes.mobileRowHeadlastValueOfLastStub]: lastValueOfLastStub,
              },
              {
                [classes.mobileRowHeadfirstValueOfLastStub2Dim]:
                  i === 0 && stubLength === 2,
              },
            )}
          >
            {tableRow}
          </tr>,
        );
        tableRow = [];
      }

      rowCursor.index++;
    }
  }

  return tableRows;
}

/**
 * Fills a row with empty cells. This is used when we are not on the last dimension of the stub. No data is available for these cells.
 *
 * @param tableMeta - The metadata for the table columns and rows.
 * @param tableRow - The array of React.JSX.Element representing the row of the table.
 */
function fillEmpty(
  tableRow: React.JSX.Element[],
  columnWindow: ColumnRenderWindow,
  nextKey: () => string,
): void {
  const emptyText = '';

  if (columnWindow.leftPadding > 0) {
    tableRow.push(
      <td
        key={nextKey()}
        className={classes.virtualPaddingCell}
        style={{ width: `${columnWindow.leftPadding}px` }}
      >
        {emptyText}
      </td>,
    );
  }

  for (let i = columnWindow.start; i < columnWindow.end; i++) {
    tableRow.push(<td key={nextKey()}>{emptyText}</td>);
  }

  if (columnWindow.rightPadding > 0) {
    tableRow.push(
      <td
        key={nextKey()}
        className={classes.virtualPaddingCell}
        style={{ width: `${columnWindow.rightPadding}px` }}
      >
        {emptyText}
      </td>,
    );
  }
}

/*
 * Fills a row with data cells.
 *
 * @param table - The PxTable object representing the PxWeb table.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param stubDataCellCodes - The metadata structure for the dimensions of the stub cells.
 * @param headingDataCellCodes - The metadata structure for the dimensions of the header cells.
 * @param tableRow - The array of React.JSX.Element representing the row of the table.
 */
function fillData(
  table: PxTable,
  columnWindow: ColumnRenderWindow,
  stubDataCellCodes: DataCellCodes,
  headingDataCellCodes: DataCellCodes[],
  tableRow: React.JSX.Element[],
  nextKey: () => string,
): void {
  if (columnWindow.leftPadding > 0) {
    tableRow.push(
      <td
        key={nextKey()}
        className={classes.virtualPaddingCell}
        style={{ width: `${columnWindow.leftPadding}px` }}
      />,
    );
  }

  for (let i = columnWindow.start; i < columnWindow.end; i++) {
    // Merge the metadata structure for the dimensions of the stub and header cells
    const dataCellCodes = stubDataCellCodes.concat(headingDataCellCodes[i]);
    const datacellIds: string[] = dataCellCodes.map((obj) => obj.htmlId);
    const headers: string = datacellIds.toString().replaceAll(',', ' ');
    const dimensions: string[] = [];
    // Arrange the dimensons in the right order according to how data is stored is the cube
    for (const dataCell of dataCellCodes) {
      dimensions[dataCell.varPos] = dataCell.valCode;
    }

    // Example of how to get data from the cube (men in Stockholm in 1970):
    // const dataValue = getPxTableData(table.data, [
    //   '0180',
    //   'men',
    //   '1970',
    // ]);

    const dataValue = getPxTableData(table.data.cube, dimensions);

    tableRow.push(
      <td key={nextKey()} headers={headers}>
        {dataValue?.formattedValue}
      </td>,
    );
  }

  if (columnWindow.rightPadding > 0) {
    tableRow.push(
      <td
        key={nextKey()}
        className={classes.virtualPaddingCell}
        style={{ width: `${columnWindow.rightPadding}px` }}
      />,
    );
  }
}

/**
 * Creates repeated mobile headers for a table and appends them to the provided table rows.
 *
 * @param {PxTable} table - The PxTable object.
 * @param {number} stubLength - The length of the stub.
 * @param {number} stubIndex - The index of the stub.
 * @param {DataCellCodes} stubDataCellCodes - An array of data cell codes containing HTML IDs and value labels.
 * @param {React.JSX.Element[]} tableRows - An array of table row elements to which the repeated headers will be appended.
 */
function createRepeatedMobileHeader({
  table,
  stubLength,
  stubIndex,
  stubDataCellCodes,
  tableRows,
  uniqueIdCounter,
  nextKey,
  rowWindow,
  rowCursor,
}: CreateRepeatedMobileHeaderParams) {
  let tableRowRepeatHeader: React.JSX.Element[] = [];
  for (let n = 0; n <= stubLength - 3; n++) {
    uniqueIdCounter.idCounter++;
    let variable = table.stub[n];
    let tempid =
      stubDataCellCodes[n].varId +
      '_' +
      stubDataCellCodes[n].valCode +
      '_I' +
      uniqueIdCounter.idCounter;

    stubDataCellCodes[n].htmlId = tempid;
    if (isRowVisible(rowCursor, rowWindow)) {
      tableRowRepeatHeader.push(
        <th
          colSpan={2}
          id={stubDataCellCodes[n].htmlId}
          scope="col"
          aria-label={
            variable.type === VartypeEnum.TIME_VARIABLE
              ? `${variable.label} ${stubDataCellCodes[n].valLabel}`
              : undefined
          }
          className={cl(classes.stub, classes[`stub-${stubIndex}`])}
          key={nextKey()}
        >
          {stubDataCellCodes[n].valLabel}
        </th>,
      );
      tableRows.push(
        <tr
          className={cl(
            { [classes.firstdim]: n === 0 },
            {
              [classes.mobileRowHeadLevel1]: n === stubLength - 3,
            },
            classes.mobileEmptyRowCell,
          )}
          key={nextKey()}
        >
          {tableRowRepeatHeader}
        </tr>,
      );
    }
    rowCursor.index++;
    tableRowRepeatHeader = [];
  }
}

/**
 * Creates and appends a second last level mobile header row to the table rows.
 *
 * @param {number} stubIndex - The index of the stub.
 * @param {DataCellMeta} cellMeta - Metadata for the data cell.
 * @param {Variable} variable - The variable object containing the label.
 * @param {Value} val - The value object containing the label.
 * @param {number} i - The index of the current iteration.
 * @param {React.JSX.Element[]} tableRows - The array of table rows to which the new row will be appended.
 */
function createSecondLastMobileHeader({
  stubLength,
  stubIndex,
  cellMeta,
  variable,
  val,
  valueIndex,
  tableRows,
  uniqueIdCounter,
  nextKey,
  rowWindow,
  rowCursor,
}: CreateSecondLastMobileHeaderParams): void {
  // second last level
  let tableRowSecondLastHeader: React.JSX.Element[] = [];
  let tempid =
    cellMeta.varId + '_' + cellMeta.valCode + '_I' + uniqueIdCounter.idCounter;
  cellMeta.htmlId = tempid;
  if (isRowVisible(rowCursor, rowWindow)) {
    tableRowSecondLastHeader.push(
      <th
        colSpan={2}
        id={cellMeta.htmlId}
        scope="col"
        aria-label={
          variable.type === VartypeEnum.TIME_VARIABLE
            ? `${variable.label} ${val.label}`
            : undefined
        }
        className={cl(classes.stub, classes[`stub-${stubIndex}`])}
        key={nextKey()}
      >
        {val.label}
      </th>,
    );

    tableRows.push(
      <tr
        className={cl(
          { [classes.firstdim]: stubIndex === 0 },
          classes.mobileEmptyRowCell,
          // classes.mobileRowHeadSecondLastStub,
          {
            [classes.mobileRowHeadLevel2]: stubLength > 2,
          },
          {
            [classes.mobileRowHeadLevel1]: stubLength === 2,
          },

          {
            [classes.mobileRowHeadFirstValueOfSecondLastStub]: valueIndex === 0,
          },
        )}
        key={nextKey()}
      >
        {tableRowSecondLastHeader}
      </tr>,
    );
  }
  rowCursor.index++;
}

function isRowVisible(rowCursor: { index: number }, rowWindow?: RowWindow) {
  if (!rowWindow) {
    return true;
  }

  return rowCursor.index >= rowWindow.start && rowCursor.index < rowWindow.end;
}

export function createKeyFactory(): () => string {
  let counter = 0;

  return () => {
    counter += 1;
    return counter.toString();
  };
}
export default Table;
