import { PxTableMetadata } from './pxTableMetadata';
import { PxTableData } from './pxTableData';
import { Variable } from './variable';

/**
 * Represents a table in PxWeb.
 */
export type PxTable = {
  /**
   * The metadata part of the table.
   */
  metadata: PxTableMetadata;
  
  /**
   * The data part of the table.
   */
  data: PxTableData;
  
  /**
   * The stub variables of the table.
   */
  stub: Variable[];
  
  /**
   * The heading variables of the table.
   */
  heading: Variable[];
};
