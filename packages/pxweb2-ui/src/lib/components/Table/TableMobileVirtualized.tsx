import { useMemo } from 'react';

import {
  BaseVirtualizedTableProps,
  calculateMobileBodyRowCount,
  useTableRows,
  useBodyRowVirtualizationWindow,
  VirtualizedTableLayout,
} from './Table';

export function MobileVirtualizedTable({
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
  const shouldVirtualizeColumns = false;

  const columnWindow = useMemo(
    () => ({
      start: 0,
      end: tableColumnSize,
      leftPadding: 0,
      rightPadding: 0,
    }),
    [tableColumnSize],
  );

  const mobileBodyRowCount = useMemo(
    () => calculateMobileBodyRowCount(pxtable),
    [pxtable],
  );

  const {
    shouldVirtualize,
    visibleRowStart,
    visibleRowEnd,
    topPaddingHeight,
    bottomPaddingHeight,
  } = useBodyRowVirtualizationWindow({
    rowCount: mobileBodyRowCount,
    isMobile: true,
    tableScrollMargin,
    verticalScrollElement,
    scrollContainerRef,
  });

  const rowWindow = useMemo(
    () =>
      shouldVirtualize
        ? {
            start: visibleRowStart,
            end: visibleRowEnd,
          }
        : undefined,
    [shouldVirtualize, visibleRowStart, visibleRowEnd],
  );

  const { headingRows, bodyRows } = useTableRows({
    pxtable,
    tableMeta,
    tableColumnSize,
    columnWindow,
    isMobile: true,
    contentVarIndex,
    contentsVariableDecimals,
    rowWindow,
  });

  const visibleBodyRows = bodyRows;

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
