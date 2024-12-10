import { PxTable } from '../../shared-types/pxTable';

/**
 * Internal type holding metadata about the column and row structure of a table.
 */
export type columnRowMeta = {
  /**
   * The number of rows
   */
  rows: number;
  /**
   * The number of columns
   */
  columns: number;
  /**
   * The number of columns that contain headers
   */
  columnOffset: number;
  /**
   * The number of rows that contain headers
   */
  rowOffset: number;
};

/**
 * Calculates the table metadata for the given PxTable.
 * Table metadata includes information about:
 * - The number of columns in the table
 * - The number of rows in the table
 * - The number of columns that contain headers
 * - The number of rows that contain headers
 *
 * @param pxtable The PxTable object for which to calculate the metadata.
 * @returns The calculated columnRowMeta object containing the table metadata.
 */
export function calculateRowAndColumnMeta(pxtable: PxTable): columnRowMeta {
  let columnCount = 1;
  let rowCount = 1;
  const columnOffset = 1;
  const rowOffset = pxtable.heading.length;

  for (let i = 0; i < pxtable.heading.length; i++) {
    columnCount *= pxtable.heading[i].values.length;
  }

  for (let i = 0; i < pxtable.stub.length; i++) {
    rowCount *= pxtable.stub[i].values.length;
  }

  rowCount += pxtable.heading.length;
  columnCount += columnOffset;

  return {
    rows: rowCount,
    columns: columnCount,
    columnOffset: columnOffset,
    rowOffset: rowOffset,
  };
}
