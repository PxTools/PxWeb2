import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

import { PxTable } from '../../../shared-types/pxTable';
import {
  calculateRowAndColumnMeta,
  columnRowMeta,
} from '../Utils/columnRowMeta';

/** Props shared by virtualized table entry points. */
export interface VirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
}

/** Computed values and refs needed to render virtualized table variants. */
interface BaseVirtualizedTableProps {
  readonly pxtable: PxTable;
  readonly className?: string;
  readonly tableMeta: columnRowMeta;
  readonly tableColumnSize: number;
  readonly scrollContainerRef: RefObject<HTMLDivElement | null>;
  readonly verticalScrollElement: HTMLElement | null;
  readonly tableScrollMargin: number;
}

/** Vertical row slice and spacer heights for body virtualization. */
interface VisibleRowsWindow {
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

const DESKTOP_ROW_ESTIMATE_SIZE = 44;
const MOBILE_ROW_ESTIMATE_SIZE = 44;
const DESKTOP_ROW_OVERSCAN = 15;
const MOBILE_ROW_OVERSCAN = 15;
const ROW_VIRTUALIZATION_THRESHOLD = 30;
// Bootstrap rows are a temporary first window used before the virtualizer has
// measured/returned concrete items. This avoids rendering an empty tbody frame.
const DESKTOP_BOOTSTRAP_ROW_COUNT = 24;
const MOBILE_BOOTSTRAP_ROW_COUNT = 12;

/** Computes shared table metadata, refs, and derived values for virtualized tables. */
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

  return {
    pxtable,
    tableMeta,
    tableColumnSize,
    scrollContainerRef,
    verticalScrollElement,
    tableScrollMargin,
    className,
  };
}

/** Computes the currently visible row window and spacer heights for virtualization. */
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
  scrollContainerRef: RefObject<HTMLDivElement | null>;
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

  const lastNonEmptyWindowRef = useRef<VisibleRowsWindow | null>(null);

  if (!shouldVirtualize) {
    return createVisibleRowsWindowResult(
      shouldVirtualize,
      createNonVirtualizedVisibleRowsWindow(rowCount),
    );
  }

  const virtualRows = activeRowVirtualizer.getVirtualItems();
  const totalSize = activeRowVirtualizer.getTotalSize();

  const resolvedWindow = resolveVisibleRowsWindow({
    virtualRows,
    lastNonEmptyWindow: lastNonEmptyWindowRef.current,
    rowCount,
    tableScrollMargin,
    totalSize,
    bootstrapRowCount: rowVirtualizationSettings.bootstrapRowCount,
    estimatedRowSize: rowVirtualizationSettings.estimateSize,
  });

  if (virtualRows.length > 0) {
    lastNonEmptyWindowRef.current = resolvedWindow;
  }

  return createVisibleRowsWindowResult(shouldVirtualize, resolvedWindow);
}

/**
 * Resolves which element drives vertical scrolling and computes the table
 * scroll margin used by virtualization when the table lives inside another
 * scroll container.
 */
function useTableScrollContext(
  getVerticalScrollElement?: () => HTMLElement | null,
) {
  // scrollContainerRef tracks the table's outer container used for scroll event handling and geometry calculations.
  // scrollContainerRef is returned from this hook and are then attached to the table wrapper element in VirtualizedTableLayout.
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [verticalScrollElement, setVerticalScrollElement] =
    useState<HTMLElement | null>(null);
  const [tableScrollMargin, setTableScrollMargin] = useState(0);

  // Resolve the vertical scroll element
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
    // Keep the resolved scroll element in sync with layout/viewport changes.
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

  // Update the table scroll margin used for virtualization when the scroll element or table geometry changes
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

      // Margin aligns virtualizer coordinates with the active scroll source.
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
    // Recalculate on viewport changes.
    globalThis.addEventListener('resize', scheduleUpdateTableScrollMargin);

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            scheduleUpdateTableScrollMargin();
          });

    if (resizeObserver && scrollContainerRef.current) {
      // Recalculate if table or scroll container geometry changes.
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

/** Returns row virtualization sizing and overscan tuned for desktop/mobile. */
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

/** Combines a row window with its virtualization state flag. */
function createVisibleRowsWindowResult(
  shouldVirtualize: boolean,
  window: VisibleRowsWindow,
): VisibleRowsWindowResult {
  return {
    shouldVirtualize,
    ...window,
  };
}

/** Builds the full non-virtualized row window covering all rows. */
function createNonVirtualizedVisibleRowsWindow(
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
function resolveVisibleRowsWindow({
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
