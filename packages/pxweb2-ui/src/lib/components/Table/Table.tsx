import { memo, useEffect, useMemo, useRef } from 'react';
import cl from 'clsx';
import { useVirtualizer } from '@tanstack/react-virtual';

import classes from './Table.module.scss';
import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { getPxTableData } from './cubeHelper';
import { Value } from '../../shared-types/value';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { Variable } from '../../shared-types/variable';

export interface TableProps {
  readonly pxtable: PxTable;
  readonly isMobile: boolean;
  readonly className?: string;
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
  stubDataCellCodes: DataCellCodes;
  headingDataCellCodes: DataCellCodes[];
  tableRows: React.JSX.Element[];
  contentVarIndex: number;
  contentsVariableDecimals?: Record<string, { decimals: number }>;
}
interface CreateRowMobileParams {
  stubIndex: number;
  rowSpan: number;
  table: PxTable;
  tableMeta: columnRowMeta;
  stubDataCellCodes: DataCellCodes;
  headingDataCellCodes: DataCellCodes[];
  tableRows: React.JSX.Element[];
  uniqueIdCounter: { idCounter: number };
  contentVarIndex: number;
  contentsVariableDecimals?: Record<string, { decimals: number }>;
}

/**
 * Represents the metadata for multiple dimensions of a data cell.
 */
type DataCellCodes = DataCellMeta[];

type LeafDimension = {
  key: string;
  label: string;
  labelParts: string[];
  codesByPosition: (string | undefined)[];
};

type VirtualRowEntry = {
  key: string;
  leaf: LeafDimension;
  level: number;
  label: string;
  isDataRow: boolean;
};

const VIRTUALIZATION_CELL_THRESHOLD = 800;

export function shouldUseDesktopVirtualization(
  rowCount: number,
  columnCount: number,
): boolean {
  return rowCount * columnCount >= VIRTUALIZATION_CELL_THRESHOLD;
}

export const Table = memo(function Table({
  pxtable,
  isMobile,
  className = '',
}: TableProps) {
  if (isMobile) {
    return (
      <LegacyTable
        pxtable={pxtable}
        isMobile={isMobile}
        className={className}
      />
    );
  }

  return <VirtualizedDesktopTable pxtable={pxtable} className={className} />;
});

function LegacyTable({
  pxtable,
  isMobile,
  className = '',
}: Readonly<TableProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  const tableMeta: columnRowMeta = calculateRowAndColumnMeta(pxtable);

  const tableColumnSize: number = tableMeta.columns - tableMeta.columnOffset;
  const headingDataCellCodes = useMemo(
    () => new Array<DataCellCodes>(tableColumnSize),
    [tableColumnSize],
  ); // Contains header variable and value codes for each column in the table

  // Find the contents variable
  const contentsVariable = pxtable.metadata.variables.find(
    (variable) => variable.type === 'ContentsVariable',
  );

  let contentVarIndex: number = -1;
  if (contentsVariable) {
    contentVarIndex = pxtable.data.variableOrder.indexOf(contentsVariable.id);
  }

  const contentsVariableDecimals = Object.fromEntries(
    pxtable.metadata.variables
      .filter((variable) => variable.type === 'ContentsVariable')
      .flatMap((variable) =>
        variable.values.map((value) => [
          value.code,
          { decimals: value.contentInfo?.decimals ?? 6 },
        ]),
      ),
  );

  // Create empty metadata structure for the dimensions in the header.
  // This structure will be filled with metadata when the header is created.

  // Loop through all columns in the table. i is the column index
  for (let i = 0; i < tableColumnSize; i++) {
    const dataCellCodes: DataCellCodes = new Array<DataCellMeta>(
      pxtable.heading.length,
    );

    // Loop through all header variables. j is the header variable index
    for (let j = 0; j < pxtable.heading.length; j++) {
      const dataCellMeta: DataCellMeta = {
        varId: '',
        valCode: '',
        valLabel: '',
        varPos: 0,
        htmlId: '',
      };
      dataCellCodes[j] = dataCellMeta; // add empty object
    }
    headingDataCellCodes[i] = dataCellCodes;
  }

  return (
    <table
      className={cl(classes.table, classes[`bodyshort-medium`]) + cssClasses}
      aria-label={pxtable.metadata.label}
    >
      <thead>{createHeading(pxtable, tableMeta, headingDataCellCodes)}</thead>
      <tbody>
        {useMemo(
          () =>
            createRows(
              pxtable,
              tableMeta,
              headingDataCellCodes,
              isMobile,
              contentVarIndex,
              contentsVariableDecimals,
            ),
          [
            pxtable,
            tableMeta,
            headingDataCellCodes,
            isMobile,
            contentVarIndex,
            contentsVariableDecimals,
          ],
        )}
      </tbody>
    </table>
  );
}

function VirtualizedDesktopTable({
  pxtable,
  className = '',
}: Readonly<{
  pxtable: PxTable;
  className?: string;
}>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const hasStub = pxtable.stub.length > 0;
  const rowHeaderWidth = hasStub ? 260 : 0;
  const headerHeight = 44;
  const rowHeight = 36;

  const variableOrder = pxtable.data.variableOrder;

  const rowDimensions = useMemo(
    () =>
      buildLeafDimensions(
        pxtable.stub,
        variableOrder,
        variableOrder.length,
        ' / ',
      ),
    [pxtable.stub, variableOrder],
  );

  const virtualRowEntries = useMemo<VirtualRowEntry[]>(() => {
    if (!hasStub) {
      return rowDimensions.map((leaf) => ({
        key: `${leaf.key}::data`,
        leaf,
        level: 0,
        label: leaf.label,
        isDataRow: true,
      }));
    }

    return rowDimensions.flatMap((leaf) =>
      leaf.labelParts.map((label, level) => ({
        key: `${leaf.key}::${level}`,
        leaf,
        level,
        label,
        isDataRow: level === leaf.labelParts.length - 1,
      })),
    );
  }, [hasStub, rowDimensions]);

  const columnDimensions = useMemo(
    () =>
      buildLeafDimensions(
        pxtable.heading,
        variableOrder,
        variableOrder.length,
        ' · ',
      ),
    [pxtable.heading, variableOrder],
  );

  const scrollElement = rootRef.current?.parentElement as HTMLElement | null;
  const cellCacheRef = useRef<Map<string, string>>(new Map());

  const rowVirtualizer = useVirtualizer({
    count: virtualRowEntries.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => rowHeight,
    overscan: 10,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: columnDimensions.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => 112,
    overscan: 4,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const virtualColumns = columnVirtualizer.getVirtualItems();

  const renderedRows =
    virtualRows.length > 0
      ? virtualRows
      : virtualRowEntries.map((_, index) => ({
          index,
          start: index * rowHeight,
          size: rowHeight,
          key: index,
        }));

  const renderedColumns =
    virtualColumns.length > 0
      ? virtualColumns
      : columnDimensions.map((_, index) => ({
          index,
          start: index * 112,
          size: 112,
          key: index,
        }));

  const headingVariablePositions = useMemo(
    () => pxtable.heading.map((variable) => variableOrder.indexOf(variable.id)),
    [pxtable.heading, variableOrder],
  );

  const virtualHeaderRows = useMemo(
    () =>
      pxtable.heading.map((variable, headingLevel) => {
        const codeToValue = new Map(
          variable.values.map((value) => [value.code, value]),
        );
        const variablePosition = headingVariablePositions[headingLevel];
        const headerCells: React.JSX.Element[] = [];

        let currentCode: string | undefined;
        let runStart = 0;
        let runSize = 0;
        let runColSpan = 0;
        let runIndex = 0;

        const pushRun = () => {
          if (runColSpan === 0) {
            return;
          }

          const value =
            currentCode === undefined
              ? undefined
              : codeToValue.get(currentCode);

          headerCells.push(
            <th
              scope="col"
              key={`${variable.id}-${runIndex}-${runStart}`}
              colSpan={runColSpan}
              aria-label={
                variable.type === VartypeEnum.TIME_VARIABLE && value
                  ? `${variable.label} ${value.label}`
                  : undefined
              }
              className={cl(classes.virtualCell, classes.virtualColumnHeader, {
                [classes.firstColNoStub]: !hasStub && runIndex === 0,
              })}
              style={{
                width: runSize,
                height: headerHeight,
                transform: `translateX(${rowHeaderWidth + runStart}px)`,
              }}
            >
              {value?.label ?? ''}
            </th>,
          );
          runIndex++;
        };

        for (let i = 0; i < renderedColumns.length; i++) {
          const virtualColumn = renderedColumns[i];
          const column = columnDimensions[virtualColumn.index];
          const code =
            variablePosition >= 0
              ? column.codesByPosition[variablePosition]
              : undefined;

          if (i === 0) {
            currentCode = code;
            runStart = virtualColumn.start;
            runSize = virtualColumn.size;
            runColSpan = 1;
            continue;
          }

          const isContiguous = virtualColumn.start === runStart + runSize;
          if (code === currentCode && isContiguous) {
            runSize += virtualColumn.size;
            runColSpan++;
            continue;
          }

          pushRun();
          currentCode = code;
          runStart = virtualColumn.start;
          runSize = virtualColumn.size;
          runColSpan = 1;
        }

        pushRun();

        return headerCells;
      }),
    [
      pxtable.heading,
      headingVariablePositions,
      renderedColumns,
      columnDimensions,
      headerHeight,
      rowHeaderWidth,
      hasStub,
    ],
  );

  const shouldVirtualize = shouldUseDesktopVirtualization(
    virtualRowEntries.length,
    columnDimensions.length,
  );

  const pivotSignature = useMemo(
    () =>
      `${pxtable.stub.map((variable) => variable.id).join('|')}::${pxtable.heading
        .map((variable) => variable.id)
        .join('|')}::${pxtable.data.variableOrder.join('|')}`,
    [pxtable.stub, pxtable.heading, pxtable.data.variableOrder],
  );

  useEffect(() => {
    cellCacheRef.current.clear();
  }, [pivotSignature]);

  if (!shouldVirtualize) {
    return (
      <LegacyTable pxtable={pxtable} isMobile={false} className={className} />
    );
  }

  const totalBodyHeight = rowVirtualizer.getTotalSize();
  const totalDataWidth = columnVirtualizer.getTotalSize();
  const totalWidth = rowHeaderWidth + totalDataWidth;

  return (
    <div
      ref={rootRef}
      style={{
        width: totalWidth,
        minWidth: '100%',
      }}
    >
      <table
        className={cl(
          classes.table,
          classes.virtualTable,
          classes[`bodyshort-medium`],
          cssClasses,
        )}
        aria-label={pxtable.metadata.label}
      >
        <thead className={classes.virtualHeaderRowGroup}>
          {pxtable.heading.length > 0 ? (
            pxtable.heading.map((_, headingLevel) => (
              <tr
                className={classes.virtualRow}
                key={`header-row-${pxtable.heading[headingLevel].id}`}
                style={{ height: headerHeight }}
              >
                {hasStub && headingLevel === 0 && (
                  <td
                    rowSpan={pxtable.heading.length}
                    className={cl(
                      classes.virtualCell,
                      classes.virtualRowHeaderCell,
                      classes.emptyTableData,
                    )}
                    style={{
                      width: rowHeaderWidth,
                      height: headerHeight,
                    }}
                  />
                )}

                {virtualHeaderRows[headingLevel]}
              </tr>
            ))
          ) : (
            <tr className={classes.virtualRow} style={{ height: headerHeight }}>
              {hasStub && (
                <td
                  className={cl(
                    classes.virtualCell,
                    classes.virtualRowHeaderCell,
                    classes.emptyTableData,
                  )}
                  style={{
                    width: rowHeaderWidth,
                    height: headerHeight,
                  }}
                />
              )}

              {renderedColumns.map((virtualColumn) => {
                const column = columnDimensions[virtualColumn.index];

                return (
                  <th
                    scope="col"
                    key={column.key}
                    className={cl(
                      classes.virtualCell,
                      classes.virtualColumnHeader,
                      {
                        [classes.firstColNoStub]: !hasStub && virtualColumn.index === 0,
                      },
                    )}
                    style={{
                      width: virtualColumn.size,
                      height: headerHeight,
                      transform: `translateX(${rowHeaderWidth + virtualColumn.start}px)`,
                    }}
                  >
                    {column.label}
                  </th>
                );
              })}
            </tr>
          )}
        </thead>

        <tbody
          className={classes.virtualBodyRowGroup}
          style={{ height: totalBodyHeight }}
        >
          {renderedRows.map((virtualRow) => {
            const rowEntry = virtualRowEntries[virtualRow.index];

            return (
              <tr
                key={rowEntry.key}
                className={cl(classes.virtualRow, {
                  [classes.firstdim]: rowEntry.level === 0,
                })}
                style={{
                  height: virtualRow.size,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {hasStub && (
                  <th
                    scope="row"
                    className={cl(
                      classes.virtualCell,
                      classes.virtualRowHeaderCell,
                      classes.stub,
                      classes[`stub-${rowEntry.level}`],
                    )}
                    style={{
                      width: rowHeaderWidth,
                      height: virtualRow.size,
                    }}
                  >
                    {rowEntry.label}
                  </th>
                )}

                {renderedColumns.map((virtualColumn) => {
                  const column = columnDimensions[virtualColumn.index];
                  const cacheKey = `${rowEntry.leaf.key}|${column.key}`;
                  let formattedValue = cellCacheRef.current.get(cacheKey);

                  if (rowEntry.isDataRow && formattedValue === undefined) {
                    formattedValue = getVirtualCellValue(
                      pxtable,
                      rowEntry.leaf.codesByPosition,
                      column.codesByPosition,
                      variableOrder.length,
                    );
                    cellCacheRef.current.set(cacheKey, formattedValue);
                  }

                  return (
                    <td
                      key={cacheKey}
                      className={cl(
                        classes.virtualCell,
                        classes.virtualDataCell,
                      )}
                      style={{
                        width: virtualColumn.size,
                        height: virtualRow.size,
                        transform: `translateX(${rowHeaderWidth + virtualColumn.start}px)`,
                      }}
                    >
                      {rowEntry.isDataRow ? formattedValue : ''}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function buildLeafDimensions(
  variables: Variable[],
  variableOrder: string[],
  variableOrderLength: number,
  labelDelimiter: string,
): LeafDimension[] {
  if (variables.length === 0) {
    return [
      {
        key: '__root__',
        label: '',
        labelParts: [],
        codesByPosition: new Array(variableOrderLength),
      },
    ];
  }

  const combinations: LeafDimension[] = [];

  function walk(
    variableIndex: number,
    labels: string[],
    parts: string[],
    codesByPosition: (string | undefined)[],
  ) {
    const variable = variables[variableIndex];
    const varPosition = variableOrder.indexOf(variable.id);

    for (const value of variable.values) {
      labels.push(value.label);
      parts.push(`${variable.id}:${value.code}`);

      const previousCode =
        varPosition >= 0 ? codesByPosition[varPosition] : undefined;
      if (varPosition >= 0) {
        codesByPosition[varPosition] = value.code;
      }

      if (variableIndex === variables.length - 1) {
        const key = parts.join('|');
        combinations.push({
          key,
          label: labels.join(labelDelimiter),
          labelParts: [...labels],
          codesByPosition: [...codesByPosition],
        });
      } else {
        walk(variableIndex + 1, labels, parts, codesByPosition);
      }

      if (varPosition >= 0) {
        codesByPosition[varPosition] = previousCode;
      }
      parts.pop();
      labels.pop();
    }
  }

  walk(0, [], [], new Array(variableOrderLength));

  return combinations;
}

function getVirtualCellValue(
  pxtable: PxTable,
  rowCodesByPosition: (string | undefined)[],
  columnCodesByPosition: (string | undefined)[],
  variableOrderLength: number,
): string {
  const dimensions: string[] = new Array(variableOrderLength);

  for (let i = 0; i < variableOrderLength; i++) {
    dimensions[i] = rowCodesByPosition[i] ?? columnCodesByPosition[i] ?? '';
  }

  return getPxTableData(pxtable.data.cube, dimensions)?.formattedValue ?? '';
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
        key={getNewKey()}
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
        const htmlId: string =
          'H' +
          idxHeadingLevel +
          '.' +
          variable.values[i].code +
          '.I' +
          idxRepetitionCurrentHeadingLevel;
        headerRow.push(
          <th
            id={htmlId}
            scope="col"
            colSpan={columnSpan}
            key={getNewKey()}
            aria-label={
              variable.type === VartypeEnum.TIME_VARIABLE
                ? `${variable.label} ${variable.values[i].label}`
                : undefined
            }
            className={cl({
              [classes.firstColNoStub]:
                i === 0 &&
                idxRepetitionCurrentHeadingLevel === 1 &&
                table.stub.length === 0,
            })}
          >
            {variable.values[i].label}
          </th>,
        );
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

    headerRows.push(<tr key={getNewKey()}>{headerRow}</tr>);

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
  isMobile: boolean,
  contentVarIndex: number,
  contentsVariableDecimals?: Record<string, { decimals: number }>,
): React.JSX.Element[] {
  const tableRows: React.JSX.Element[] = [];
  const stubDatacellCodes: DataCellCodes = new Array<DataCellMeta>();
  if (table.stub.length > 0) {
    if (isMobile) {
      createRowMobile({
        stubIndex: 0,
        rowSpan: tableMeta.rows - tableMeta.rowOffset,
        table,
        tableMeta,
        stubDataCellCodes: stubDatacellCodes,
        headingDataCellCodes,
        tableRows,
        uniqueIdCounter: { idCounter: 0 },
        contentsVariableDecimals,
        contentVarIndex,
      });
    } else {
      createRowDesktop({
        stubIndex: 0,
        rowSpan: tableMeta.rows - tableMeta.rowOffset,
        stubIteration: 0,
        table,
        tableMeta,
        stubDataCellCodes: stubDatacellCodes,
        headingDataCellCodes,
        tableRows,
        contentsVariableDecimals,
        contentVarIndex,
      });
    }
  } else {
    const tableRow: React.JSX.Element[] = [];
    fillData(
      table,
      tableMeta,
      stubDatacellCodes,
      headingDataCellCodes,
      tableRow,
    );
    tableRows.push(
      <tr key={getNewKey()} className={cl(classes.firstColNoStub)}>
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
  stubDataCellCodes,
  headingDataCellCodes,
  tableRows,
  contentVarIndex,
  contentsVariableDecimals,
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
        key={getNewKey()}
      >
        {val.label}
      </th>,
    );

    // If there are more stub variables that need to add headers to this row
    if (table.stub.length > stubIndex + 1) {
      // make the rest of this row empty
      fillEmpty(tableMeta, tableRow);
      tableRows.push(
        <tr
          className={cl({ [classes.firstdim]: stubIndex === 0 })}
          key={getNewKey()}
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
        stubDataCellCodes,
        headingDataCellCodes,
        tableRows,
        contentVarIndex,
        contentsVariableDecimals,
      });
      stubDataCellCodes.pop();
    } else {
      // If no more stubs need to add headers then fill the row with data
      fillData(
        table,
        tableMeta,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRow,
      );
      tableRows.push(<tr key={getNewKey()}>{tableRow}</tr>);
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
  stubDataCellCodes,
  headingDataCellCodes,
  tableRows,
  uniqueIdCounter,
  contentVarIndex,
  contentsVariableDecimals,
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
    stubDataCellCodes.push(cellMeta);
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
          createRepeatedMobileHeader(
            table,
            stubLength,
            stubIndex,
            stubDataCellCodes,
            tableRows,
            uniqueIdCounter,
          );
          break;
        }
        case stubLength - 2: {
          // second last level
          createSecondLastMobileHeader(
            stubLength,
            stubIndex,
            cellMeta,
            variable,
            val,
            i,
            tableRows,
            uniqueIdCounter,
          );
          break;
        }
      }
      // Create a new row for the next stub
      createRowMobile({
        stubIndex: stubIndex + 1,
        rowSpan,
        table,
        tableMeta,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRows,
        uniqueIdCounter,
        contentVarIndex,
        contentsVariableDecimals,
      });
      stubDataCellCodes.pop();
    } else {
      // last level
      let tempid =
        cellMeta.varId +
        '_' +
        cellMeta.valCode +
        '_I' +
        uniqueIdCounter.idCounter;
      cellMeta.htmlId = tempid;
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
          key={getNewKey()}
        >
          {val.label}
        </th>,
      );
      fillData(
        table,
        tableMeta,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRow,
      );
      tableRows.push(
        <tr
          key={getNewKey()}
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
      stubDataCellCodes.pop();
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
  tableMeta: columnRowMeta,
  tableRow: React.JSX.Element[],
): void {
  const emptyText = '';

  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  // Loop through all data columns in the table
  for (let i = 0; i < maxCols; i++) {
    tableRow.push(<td key={getNewKey()}>{emptyText}</td>);
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
  tableMeta: columnRowMeta,
  stubDataCellCodes: DataCellCodes,
  headingDataCellCodes: DataCellCodes[],
  tableRow: React.JSX.Element[],
): void {
  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  // Loop through all data columns in the table

  for (let i = 0; i < maxCols; i++) {
    // Merge the metadata structure for the dimensions of the stub and header cells
    const dataCellCodes = stubDataCellCodes.concat(headingDataCellCodes[i]);
    const datacellIds: string[] = dataCellCodes.map((obj) => obj.htmlId);
    const headers: string = datacellIds.toString().replace(/,/g, ' ');
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
      <td key={getNewKey()} headers={headers}>
        {dataValue?.formattedValue}
      </td>,
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
function createRepeatedMobileHeader(
  table: PxTable,
  stubLength: number,
  stubIndex: number,
  stubDataCellCodes: DataCellCodes,
  tableRows: React.JSX.Element[],
  uniqueIdCounter: { idCounter: number },
) {
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
        key={getNewKey()}
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
        key={getNewKey()}
      >
        {tableRowRepeatHeader}
      </tr>,
    );
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
function createSecondLastMobileHeader(
  stubLength: number,
  stubIndex: number,
  cellMeta: DataCellMeta,
  variable: Variable,
  val: Value,
  i: number,
  tableRows: React.JSX.Element[],
  uniqueIdCounter: { idCounter: number },
): void {
  // second last level
  let tableRowSecondLastHeader: React.JSX.Element[] = [];
  let tempid =
    cellMeta.varId + '_' + cellMeta.valCode + '_I' + uniqueIdCounter.idCounter;
  cellMeta.htmlId = tempid;
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
      key={getNewKey()}
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
          [classes.mobileRowHeadFirstValueOfSecondLastStub]: i === 0,
        },
      )}
      key={getNewKey()}
    >
      {tableRowSecondLastHeader}
    </tr>,
  );
}

let number = 0;

// TODO: Get keys from id:s in the PxTable object
function getNewKey(): string {
  number = number + 1;
  return number.toString();
}
export default Table;
