import { useMemo } from 'react';
import cl from 'clsx';

import {
  createHeadingRowsAndDataCellCodes,
  createVirtualPaddingCell,
  createKeyFactory,
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
          { [classes.mobileRowHeadLevel1]: n === stubLength - 3 },
          classes.mobileEmptyRowCell,
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
        classes.mobileEmptyRowCell,
        { [classes.mobileRowHeadLevel2]: stubLength > 2 },
        { [classes.mobileRowHeadLevel1]: stubLength === 2 },
        { [classes.mobileRowHeadFirstValueOfSecondLastStub]: valueIndex === 0 },
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
          classes.mobileRowHeadLastStub,
          { [classes.mobileRowHeadlastValueOfLastStub]: lastValueOfLastStub },
          {
            [classes.mobileRowHeadfirstValueOfLastStub2Dim]:
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
      cells.push(createVirtualPaddingCell(columnWindow.endPadding, nextKey, 'end'));
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
