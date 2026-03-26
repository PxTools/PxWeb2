import { useMemo } from 'react';
import cl from 'clsx';

import {
  createHeading,
  createHeadingDataCellCodes,
  createKeyFactory,
  useBodyRowVirtualizationWindow,
  useVirtualizedTableBaseProps,
  VirtualizedTableLayout,
  VirtualizedTableProps,
} from './Table';
import classes from './Table.module.scss';
import { getPxTableData } from './cubeHelper';
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
  start: number;
  end: number;
  startPadding: number;
  endPadding: number;
};

function getAriaLabel(variable: Variable, label: string): string | undefined {
  return variable.type === VartypeEnum.TIME_VARIABLE
    ? `${variable.label} ${label}`
    : undefined;
}

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

  const walk = (stubIndex: number) => {
    const variable = pxtable.stub[stubIndex];
    const values = variable.values;

    for (let valueIndex = 0; valueIndex < values.length; valueIndex++) {
      uniqueIdCounter.idCounter++;
      const value = values[valueIndex];
      stubDataCellCodes[stubIndex] = {
        varPos: pxtable.data.variableOrder.indexOf(variable.id),
        valCode: value.code,
        htmlId: '',
        valLabel: value.label,
      };

      const isLeafLevel = stubIndex === stubLength - 1;

      if (!isLeafLevel) {
        if (stubIndex === stubLength - 3) {
          pushRepeatedHeaders(stubIndex);
        } else if (stubIndex === stubLength - 2) {
          pushSecondLastHeader(
            stubIndex,
            variable,
            value.code,
            value.label,
            valueIndex,
          );
        }

        walk(stubIndex + 1);
        continue;
      }

      const cellId = createCellId(variable.id, value.code);
      stubDataCellCodes[stubIndex].htmlId = cellId;
      const lastValueOfLastStub = valueIndex === values.length - 1;

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
          className: cl(classes.stub, classes[`stub-${stubIndex}`]),
          ariaLabel: getAriaLabel(variable, value.label),
        },
        isDataRow: true,
        stubCellCodes: stubDataCellCodes.map((code) => ({ ...code })),
      });
    }
  };

  walk(0);
  return rows;
}

function createPaddingCell(width: number, nextKey: () => string) {
  return (
    <td
      key={nextKey()}
      className={classes.virtualPaddingCell}
      style={{ width: `${width}px` }}
    />
  );
}

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
      let colIndex = columnWindow.start;
      colIndex < columnWindow.end;
      colIndex++
    ) {
      const headingCodes = headingDataCellCodes[colIndex];
      const dataCodes = stubCodes.concat(headingCodes);
      const headers = dataCodes.map((meta) => meta.htmlId).join(' ');
      const dimensions: string[] = [];

      for (const meta of dataCodes) {
        dimensions[meta.varPos] = meta.valCode;
      }

      const dataValue = getPxTableData(cube, dimensions);
      dataCells.push(
        <td key={nextKey()} headers={headers}>
          {dataValue?.formattedValue}
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
      cells.push(createPaddingCell(columnWindow.startPadding, nextKey));
    }

    if (row.isDataRow) {
      const stubCodes = row.stubCellCodes ?? [];
      cells.push(...createDataCells(stubCodes));
    }

    if (columnWindow.endPadding > 0) {
      cells.push(createPaddingCell(columnWindow.endPadding, nextKey));
    }

    renderedRows.push(
      <tr key={row.key} className={row.className}>
        {cells}
      </tr>,
    );
  }

  return renderedRows;
}

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
      start: 0,
      end: tableColumnSize,
      startPadding: 0,
      endPadding: 0,
    }),
    [tableColumnSize],
  );

  const headingDataCellCodes = useMemo(
    () => createHeadingDataCellCodes(pxtable, tableColumnSize),
    [pxtable, tableColumnSize],
  );

  const headingRows = useMemo(
    () =>
      createHeading(
        pxtable,
        tableMeta,
        headingDataCellCodes,
        columnWindow,
        createKeyFactory(),
      ),
    [pxtable, tableMeta, headingDataCellCodes, columnWindow],
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
