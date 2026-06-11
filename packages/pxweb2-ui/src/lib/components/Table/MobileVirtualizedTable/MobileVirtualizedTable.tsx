import { useMemo } from 'react';
import cl from 'clsx';

import { VirtualizedTableLayout } from '../VirtualizedTableLayout/VirtualizedTableLayout';
import classes from '../Table.module.scss';
import mobileClasses from './MobileVirtualizedTable.module.scss';
import {
  createHeadingRowsAndDataCellCodes,
  createVirtualPaddingCell,
  createKeyFactory,
} from '../Utils/tableHelper';
import {
  useBodyRowVirtualizationWindow,
  useVirtualizedTableBaseProps,
  VirtualizedTableProps,
} from '../Hooks/tableHooks';
import { resolveDataCell } from '../Utils/tableCellData';
import { walkStubTree } from '../Utils/tableStubTraversal';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import { Variable } from '../../../shared-types/variable';

type StubCellMeta = {
  varPos: number;
  valCode: string;
  htmlId: string;
  valLabel: string;
};

type MobileHeaderCell = {
  id: string;
  scope: 'col' | 'row';
  label: string;
  className: string;
  colSpan?: number;
  ariaLabel?: string;
};

type MobileRowEntry = {
  key: string;
  className?: string;
  headerCell?: MobileHeaderCell;
  isDataRow: boolean;
  stubCellCodes?: StubCellMeta[];
};

type ColumnWindow = {
  visibleColumnStart: number;
  visibleColumnEnd: number;
  startPadding: number;
  endPadding: number;
};

/** Builds an accessibility label for time variables and leaves others undefined. */
function getAriaLabel(variable: Variable, label: string): string | undefined {
  return variable.type === VartypeEnum.TIME_VARIABLE
    ? `${variable.label} ${label}`
    : undefined;
}

/** Flattens stub dimensions into mobile row entries with header/data row metadata. */
function buildMobileRowEntries(pxtable: VirtualizedTableProps['pxtable']) {
  const stubLength = pxtable.stub.length;

  if (stubLength === 0) {
    return [
      {
        key: 'mobile-no-stub',
        className: classes.firstColNoStub,
        isDataRow: true,
        stubCellCodes: [],
      },
    ] as MobileRowEntry[];
  }

  const rows: MobileRowEntry[] = [];
  const stubDataCellCodes: StubCellMeta[] = new Array(stubLength);
  const uniqueIdCounter = { idCounter: 0 };

  const createCellId = (varId: string, valCode: string) =>
    `${varId}_${valCode}_I${uniqueIdCounter.idCounter}`;

  const pushRepeatedHeaders = (stubIndex: number) => {
    for (let n = 0; n <= stubLength - 3; n++) {
      uniqueIdCounter.idCounter++;
      const currentMeta = stubDataCellCodes[n];
      const variable = pxtable.stub[n];

      if (!currentMeta || !variable) {
        continue;
      }

      currentMeta.htmlId = createCellId(variable.id, currentMeta.valCode);

      rows.push({
        key: `mobile-repeat-${n}-${currentMeta.htmlId}`,
        className: cl(
          { [classes.firstdim]: n === 0 },
          { [mobileClasses.mobileRowHeadLevel1]: n === stubLength - 3 },
          mobileClasses.mobileEmptyRowCell,
        ),
        headerCell: {
          id: currentMeta.htmlId,
          scope: 'col',
          label: currentMeta.valLabel,
          className: cl(classes.stub, classes[`stub-${stubIndex}`]),
          colSpan: 2,
          ariaLabel: getAriaLabel(variable, currentMeta.valLabel),
        },
        isDataRow: false,
      });
    }
  };

  const pushSecondLastHeader = (
    stubIndex: number,
    variable: Variable,
    valCode: string,
    valLabel: string,
    valueIndex: number,
  ) => {
    const cellId = createCellId(variable.id, valCode);
    stubDataCellCodes[stubIndex].htmlId = cellId;

    rows.push({
      key: `mobile-second-last-${cellId}`,
      className: cl(
        { [classes.firstdim]: stubIndex === 0 },
        mobileClasses.mobileEmptyRowCell,
        { [mobileClasses.mobileRowHeadLevel2]: stubLength > 2 },
        { [mobileClasses.mobileRowHeadLevel1]: stubLength === 2 },
        {
          [mobileClasses.mobileRowHeadFirstValueOfSecondLastStub]:
            valueIndex === 0,
        },
      ),
      headerCell: {
        id: cellId,
        scope: 'col',
        label: valLabel,
        className: cl(classes.stub, classes[`stub-${stubIndex}`]),
        colSpan: 2,
        ariaLabel: getAriaLabel(variable, valLabel),
      },
      isDataRow: false,
    });
  };

  // walkStubTree visits every stub node depth-first. Non-leaf visits are used
  // to create mobile header/group rows, while leaf visits produce data rows
  // with a full stub coordinate path for data-cell lookup.
  //
  // Parameters passed to walkStubTree:
  // - pxtable: the table that defines the stub tree to traverse.
  // - createPathItem: callback defined here by this mobile caller. It creates
  //   StubCellMeta for the current node, which is stored in `path` and reused
  //   when constructing header ids and row data coordinates.
  // - onVisit: callback defined here by this mobile caller. It runs for each
  //   visited node and decides whether to push group/header rows (non-leaf) or
  //   data rows (leaf), based on traversal state.
  walkStubTree<StubCellMeta>({
    pxtable,
    createPathItem: ({ variable, value }) => {
      uniqueIdCounter.idCounter++;

      return {
        varPos: pxtable.data.variableOrder.indexOf(variable.id),
        valCode: value.code,
        htmlId: '',
        valLabel: value.label,
      };
    },
    onVisit: ({ level, variable, value, valueIndex, isLeaf, path }) => {
      // Copy the traversed branch into the reusable stub buffer up to current
      // depth so each emitted row has the correct coordinate prefix.
      for (let idx = 0; idx <= level; idx++) {
        stubDataCellCodes[idx] = path[idx];
      }

      if (!isLeaf) {
        if (level === stubLength - 3) {
          pushRepeatedHeaders(level);
        } else if (level === stubLength - 2) {
          pushSecondLastHeader(
            level,
            variable,
            value.code,
            value.label,
            valueIndex,
          );
        }

        return;
      }

      const cellId = createCellId(variable.id, value.code);
      stubDataCellCodes[level].htmlId = cellId;
      const lastValueOfLastStub = valueIndex === variable.values.length - 1;

      rows.push({
        key: `mobile-leaf-${cellId}`,
        className: cl(
          mobileClasses.mobileRowHeadLastStub,
          {
            [mobileClasses.mobileRowHeadlastValueOfLastStub]:
              lastValueOfLastStub,
          },
          {
            [mobileClasses.mobileRowHeadfirstValueOfLastStub2Dim]:
              valueIndex === 0 && stubLength === 2,
          },
        ),
        headerCell: {
          id: cellId,
          scope: 'row',
          label: value.label,
          className: cl(classes.stub, classes[`stub-${level}`]),
          ariaLabel: getAriaLabel(variable, value.label),
        },
        isDataRow: true,
        stubCellCodes: stubDataCellCodes.map((code) => ({ ...code })),
      });
    },
  });

  return rows;
}

/** Renders mobile body rows for the current row and column render windows. */
function renderMobileBodyRows({
  rows,
  columnWindow,
  headingDataCellCodes,
  cube,
}: {
  rows: MobileRowEntry[];
  columnWindow: ColumnWindow;
  headingDataCellCodes: StubCellMeta[][];
  cube: VirtualizedTableProps['pxtable']['data']['cube'];
}): React.JSX.Element[] {
  const nextKey = createKeyFactory();
  const renderedRows: React.JSX.Element[] = [];

  const createDataCells = (stubCodes: StubCellMeta[]) => {
    const dataCells: React.JSX.Element[] = [];

    for (
      let colIndex = columnWindow.visibleColumnStart;
      colIndex < columnWindow.visibleColumnEnd;
      colIndex++
    ) {
      const dataValue = resolveDataCell(
        stubCodes.concat(headingDataCellCodes[colIndex]),
        cube,
      );
      dataCells.push(
        <td key={nextKey()} headers={dataValue.headers}>
          {dataValue.formattedValue}
        </td>,
      );
    }

    return dataCells;
  };

  for (const row of rows) {
    const cells: React.JSX.Element[] = [];

    if (row.headerCell) {
      cells.push(
        <th
          key={row.headerCell.id}
          id={row.headerCell.id}
          scope={row.headerCell.scope}
          colSpan={row.headerCell.colSpan}
          aria-label={row.headerCell.ariaLabel}
          className={row.headerCell.className}
        >
          {row.headerCell.label}
        </th>,
      );
    }

    if (columnWindow.startPadding > 0) {
      cells.push(createVirtualPaddingCell(columnWindow.startPadding, nextKey));
    }

    if (row.isDataRow) {
      const stubCodes = row.stubCellCodes ?? [];
      cells.push(...createDataCells(stubCodes));
    }

    if (columnWindow.endPadding > 0) {
      cells.push(
        createVirtualPaddingCell(columnWindow.endPadding, nextKey, 'end'),
      );
    }

    renderedRows.push(
      <tr key={row.key} className={row.className}>
        {cells}
      </tr>,
    );
  }

  return renderedRows;
}

/** Renders the mobile table variant with row virtualization enabled. */
export function MobileVirtualizedTable({
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

  const shouldVirtualizeColumns = false;

  const columnWindow = useMemo(
    () => ({
      visibleColumnStart: 0,
      visibleColumnEnd: tableColumnSize,
      startPadding: 0,
      endPadding: 0,
    }),
    [tableColumnSize],
  );

  // Mobile table do not have any variables in the heading,
  // so headingDataCellCodes are only used for data cell coordinate construction and not
  // rendered as part of the heading rows.
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

  const mobileRowEntries = useMemo(
    () => buildMobileRowEntries(pxtable),
    [pxtable],
  );

  const {
    shouldVirtualize,
    visibleRowStart,
    visibleRowEnd,
    topPaddingHeight,
    bottomPaddingHeight,
  } = useBodyRowVirtualizationWindow({
    rowCount: mobileRowEntries.length,
    isMobile: true,
    tableScrollMargin,
    verticalScrollElement,
    scrollContainerRef,
  });

  const visibleMobileRows = shouldVirtualize
    ? mobileRowEntries.slice(visibleRowStart, visibleRowEnd)
    : mobileRowEntries;

  const visibleBodyRows = useMemo(
    () =>
      renderMobileBodyRows({
        rows: visibleMobileRows,
        columnWindow,
        headingDataCellCodes,
        cube: pxtable.data.cube,
      }),
    [visibleMobileRows, columnWindow, headingDataCellCodes, pxtable.data.cube],
  );

  const renderedColumnCount = tableMeta.columnOffset + tableColumnSize;

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
