import { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import cl from 'clsx';

import {
  createHeadingRowsAndDataCellCodes,
  createVirtualPaddingCell,
  createKeyFactory,
  DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD,
  DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD,
  useBodyRowVirtualizationWindow,
  useVirtualizedTableBaseProps,
  VirtualizedTableLayout,
  VirtualizedTableProps,
} from './Table';
import classes from './Table.module.scss';
import { resolveDataCell } from './TableCellData';
import { walkStubTree } from './TableStubTraversal';
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
  visibleColumnStart: number;
  visibleColumnEnd: number;
  startPadding: number;
  endPadding: number;
};

type VirtualColumnItem = {
  index: number;
  start: number;
  end: number;
};

const DESKTOP_COLUMN_ESTIMATE_SIZE = 70;
const DESKTOP_COLUMN_OVERSCAN = 8;
const DESKTOP_BOOTSTRAP_COLUMN_COUNT = 12;
const EMPTY_VIRTUAL_COLUMNS: never[] = [];

/** Chooses bootstrap/last/computed desktop column window from virtualizer output. */
function resolveVisibleColumnsWindow({
  shouldVirtualizeColumns,
  virtualColumns,
  lastNonEmptyColumnWindow,
  tableColumnSize,
  totalSize,
  bootstrapColumnWindow,
}: {
  shouldVirtualizeColumns: boolean;
  virtualColumns: VirtualColumnItem[];
  lastNonEmptyColumnWindow: ColumnWindow | null;
  tableColumnSize: number;
  totalSize: number;
  bootstrapColumnWindow: ColumnWindow;
}): ColumnWindow {
  if (!shouldVirtualizeColumns) {
    return {
      visibleColumnStart: 0,
      visibleColumnEnd: tableColumnSize,
      startPadding: 0,
      endPadding: 0,
    };
  }

  if (virtualColumns.length === 0) {
    return lastNonEmptyColumnWindow ?? bootstrapColumnWindow;
  }

  const firstVirtualColumn = virtualColumns[0];
  const lastVirtualColumn = virtualColumns.at(-1);

  return {
    visibleColumnStart: firstVirtualColumn?.index ?? 0,
    visibleColumnEnd: lastVirtualColumn
      ? lastVirtualColumn.index + 1
      : tableColumnSize,
    startPadding: firstVirtualColumn?.start ?? 0,
    endPadding: lastVirtualColumn ? totalSize - lastVirtualColumn.end : 0,
  };
}

/** Renders a single body row when the table has no stub dimensions. */
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

  if (columnWindow.startPadding > 0) {
    rowCells.push(createVirtualPaddingCell(columnWindow.startPadding, nextKey));
  }

  for (
    let colIndex = columnWindow.visibleColumnStart;
    colIndex < columnWindow.visibleColumnEnd;
    colIndex++
  ) {
    const dataValue = resolveDataCell(headingDataCellCodes[colIndex], cube);
    rowCells.push(
      <td key={nextKey()} headers={dataValue.headers}>
        {dataValue.formattedValue}
      </td>,
    );
  }

  if (columnWindow.endPadding > 0) {
    rowCells.push(createVirtualPaddingCell(columnWindow.endPadding, nextKey));
  }

  return [
    <tr key={nextKey()} className={classes.firstColNoStub}>
      {rowCells}
    </tr>,
  ];
}

/** Renders desktop body rows for the current visible row and column windows. */
function renderDesktopBodyRows({
  rows,
  columnWindow,
  hasFewColumns,
  headingDataCellCodes,
  cube,
}: {
  rows: DesktopRowEntry[];
  columnWindow: ColumnWindow;
  hasFewColumns: boolean;
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
        className={cl(
          classes.stub,
          { [classes.stubFewColumns]: hasFewColumns },
          classes[`stub-${rowEntry.level}`],
        )}
        key={nextKey()}
      >
        {rowEntry.label}
      </th>,
    ];

    if (columnWindow.startPadding > 0) {
      rowCells.push(
        createVirtualPaddingCell(columnWindow.startPadding, nextKey),
      );
    }

    for (
      let colIndex = columnWindow.visibleColumnStart;
      colIndex < columnWindow.visibleColumnEnd;
      colIndex++
    ) {
      if (!rowEntry.isDataRow) {
        rowCells.push(<td key={nextKey()} />);
        continue;
      }

      try {
        const dataMeta = resolveDataCell(
          rowEntry.stubCellCodes.concat(headingDataCellCodes[colIndex]),
          cube,
        );

        rowCells.push(
          <td key={nextKey()} headers={dataMeta.headers}>
            {dataMeta.formattedValue}
          </td>,
        );
      } catch {
        rowCells.push(<td key={nextKey()} />);
      }
    }

    if (columnWindow.endPadding > 0) {
      rowCells.push(createVirtualPaddingCell(columnWindow.endPadding, nextKey));
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

/** Expands stub dimensions into flat desktop row entries with data-row markers. */
function buildDesktopRowEntries(pxtable: VirtualizedTableProps['pxtable']) {
  if (pxtable.stub.length === 0) {
    return [] as DesktopRowEntry[];
  }

  const rowEntries: DesktopRowEntry[] = [];
  let stubIteration = 0;

  walkStubTree<StubCellMeta>({
    pxtable,
    createPathItem: ({ level, variable, value }) => {
      if (level === 0) {
        stubIteration++;
      }

      return {
        varPos: pxtable.data.variableOrder.indexOf(variable.id),
        valCode: value.code,
        htmlId: `R.${level}${value.code}.I${stubIteration}`,
      };
    },
    onVisit: ({ level, variable, value, isLeaf, path }) => {
      rowEntries.push({
        key: `${level}:${value.code}:${stubIteration}:${rowEntries.length}`,
        level,
        label: value.label,
        isDataRow: isLeaf,
        isFirstDimGroupRow: level === 0 && pxtable.stub.length > 1,
        variable,
        stubCellCodes: path,
      });
    },
  });

  return rowEntries;
}

/** Renders the desktop table using row and column virtualization windows. */
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
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    enabled: shouldVirtualizeColumns,
    count: tableColumnSize,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => DESKTOP_COLUMN_ESTIMATE_SIZE,
    overscan: DESKTOP_COLUMN_OVERSCAN,
  });

  const virtualColumns = shouldVirtualizeColumns
    ? columnVirtualizer.getVirtualItems()
    : EMPTY_VIRTUAL_COLUMNS;

  const lastNonEmptyColumnWindowRef = useRef<{
    visibleColumnStart: number;
    visibleColumnEnd: number;
    startPadding: number;
    endPadding: number;
  } | null>(null);
  const bootstrapColumnEnd = Math.min(
    tableColumnSize,
    DESKTOP_BOOTSTRAP_COLUMN_COUNT,
  );
  const bootstrapColumnWindow = useMemo(
    () => ({
      visibleColumnStart: 0,
      visibleColumnEnd: bootstrapColumnEnd,
      startPadding: 0,
      endPadding: Math.max(
        0,
        columnVirtualizer.getTotalSize() -
          bootstrapColumnEnd * DESKTOP_COLUMN_ESTIMATE_SIZE,
      ),
    }),
    [bootstrapColumnEnd, columnVirtualizer],
  );

  const columnWindow = useMemo(() => {
    const resolvedWindow = resolveVisibleColumnsWindow({
      shouldVirtualizeColumns,
      virtualColumns,
      lastNonEmptyColumnWindow: lastNonEmptyColumnWindowRef.current,
      tableColumnSize,
      totalSize: columnVirtualizer.getTotalSize(),
      bootstrapColumnWindow,
    });

    if (virtualColumns.length > 0) {
      lastNonEmptyColumnWindowRef.current = resolvedWindow;
    }

    return resolvedWindow;
  }, [
    shouldVirtualizeColumns,
    virtualColumns,
    tableColumnSize,
    bootstrapColumnWindow,
    columnVirtualizer,
  ]);

  const { headingRows, headingDataCellCodes } = useMemo(
    () =>
      createHeadingRowsAndDataCellCodes({
        table: pxtable,
        tableMeta,
        tableColumnSize,
        columnWindow,
        nextKey: createKeyFactory(),
      }),
    [pxtable, tableMeta, tableColumnSize, columnWindow],
  );

  const desktopRowEntries = useMemo(
    () => buildDesktopRowEntries(pxtable),
    [pxtable],
  );

  const hasNoStub = pxtable.stub.length === 0;
  const hasFewColumns =
    tableColumnSize <= DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD;

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
      hasFewColumns,
      headingDataCellCodes,
      cube: pxtable.data.cube,
    });
  }, [
    columnWindow,
    hasFewColumns,
    hasNoStub,
    headingDataCellCodes,
    pxtable.data.cube,
    visibleDesktopRows,
  ]);

  const renderedColumnCount =
    tableMeta.columnOffset +
    (columnWindow.visibleColumnEnd - columnWindow.visibleColumnStart) +
    (columnWindow.startPadding > 0 ? 1 : 0) +
    (columnWindow.endPadding > 0 ? 1 : 0);

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
    />
  );
}
