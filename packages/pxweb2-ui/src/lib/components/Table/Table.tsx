import { memo } from 'react';
import { DesktopVirtualizedTable } from './DesktopVirtualizedTable/DesktopVirtualizedTable';
import { MobileVirtualizedTable } from './MobileVirtualizedTable/MobileVirtualizedTable';
export { VirtualizedTableLayout } from './VirtualizedTableLayout/VirtualizedTableLayout';
export type { VirtualizedTableLayoutProps } from './VirtualizedTableLayout/VirtualizedTableLayout';
export {
  createHeading,
  createHeadingRowsAndDataCellCodes,
  createVirtualPaddingCell,
  useBodyRowVirtualizationWindow,
} from './Utils/tableHelper';
import { PxTable } from '../../shared-types/pxTable';

/** Public props for the table component that selects desktop/mobile rendering. */
export interface TableProps {
  readonly pxtable: PxTable;
  readonly getVerticalScrollElement?: () => HTMLElement | null;
  readonly className?: string;
  readonly isMobile: boolean;
}

export const DESKTOP_COLUMN_VIRTUALIZATION_THRESHOLD = 15;
export const DESKTOP_COLUMN_VIRTUALIZATION_FEW_COLUMNS_THRESHOLD = 4; // If there are few columns, we can allow more characters before wrapping, as there is more horizontal space available.

/** Renders the mobile or desktop table variant based on viewport mode. */
export const Table = memo(function Table({
  pxtable,
  isMobile,
  getVerticalScrollElement,
  className = '',
}: TableProps) {
  if (isMobile) {
    return (
      <MobileVirtualizedTable
        pxtable={pxtable}
        getVerticalScrollElement={getVerticalScrollElement}
        className={className}
      />
    );
  }

  return (
    <DesktopVirtualizedTable
      pxtable={pxtable}
      getVerticalScrollElement={getVerticalScrollElement}
      className={className}
    />
  );
});

export default Table;
