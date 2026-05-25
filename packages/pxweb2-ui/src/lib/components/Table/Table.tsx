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
