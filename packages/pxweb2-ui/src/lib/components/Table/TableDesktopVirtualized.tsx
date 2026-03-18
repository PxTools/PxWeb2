import { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import {
  BaseVirtualizedTableProps,
  DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD,
  useTableRows,
  useBodyRowVirtualizationWindow,
  VirtualizedTableLayout,
} from './Table';

export function DesktopVirtualizedTable({
  pxtable,
  tableMeta,
  tableColumnSize,
  contentVarIndex,
  contentsVariableDecimals,
  scrollContainerRef,
  verticalScrollElement,
  tableScrollMargin,
  className = '',
}: BaseVirtualizedTableProps) {
  const shouldVirtualizeColumns =
    tableColumnSize > DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD;
  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    enabled: shouldVirtualizeColumns,
    count: tableColumnSize,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 88,
    overscan: 8,
  });

  const virtualColumns = shouldVirtualizeColumns
    ? columnVirtualizer.getVirtualItems()
    : [];
  const firstVirtualColumn = virtualColumns[0];
  const lastVirtualColumn = virtualColumns.at(-1);

  const columnWindow = useMemo(
    () =>
      shouldVirtualizeColumns
        ? {
            start: firstVirtualColumn?.index ?? 0,
            end: lastVirtualColumn
              ? lastVirtualColumn.index + 1
              : tableColumnSize,
            leftPadding: firstVirtualColumn?.start ?? 0,
            rightPadding: lastVirtualColumn
              ? columnVirtualizer.getTotalSize() - lastVirtualColumn.end
              : 0,
          }
        : {
            start: 0,
            end: tableColumnSize,
            leftPadding: 0,
            rightPadding: 0,
          },
    [
      shouldVirtualizeColumns,
      firstVirtualColumn,
      lastVirtualColumn,
      tableColumnSize,
      columnVirtualizer,
    ],
  );

  const { headingRows, bodyRows } = useTableRows({
    pxtable,
    tableMeta,
    tableColumnSize,
    columnWindow,
    isMobile: false,
    contentVarIndex,
    contentsVariableDecimals,
  });

  const {
    shouldVirtualize,
    visibleRowStart,
    visibleRowEnd,
    topPaddingHeight,
    bottomPaddingHeight,
  } = useBodyRowVirtualizationWindow({
    rowCount: bodyRows.length,
    isMobile: false,
    tableScrollMargin,
    verticalScrollElement,
    scrollContainerRef,
  });

  const visibleBodyRows = shouldVirtualize
    ? bodyRows.slice(visibleRowStart, visibleRowEnd)
    : bodyRows;

  const renderedColumnCount =
    tableMeta.columnOffset +
    (columnWindow.end - columnWindow.start) +
    (columnWindow.leftPadding > 0 ? 1 : 0) +
    (columnWindow.rightPadding > 0 ? 1 : 0);

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
