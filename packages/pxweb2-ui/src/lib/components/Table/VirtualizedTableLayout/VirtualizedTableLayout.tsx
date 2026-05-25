import cl from 'clsx';

import classes from '../Table.module.scss';
import desktopClasses from '../DesktopVirtualizedTable/DesktopVirtualizedTable.module.scss';
import { PxTable } from '../../../shared-types/pxTable';

/** Inputs required by the generic virtualized table layout wrapper. */
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

/** Renders the shared table shell with optional virtual top/bottom spacer rows. */
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
            [desktopClasses.virtualizedTable]: shouldVirtualizeColumns,
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
