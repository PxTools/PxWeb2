import { PxTable } from "../../shared-types/pxTable";

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
    Calculate the table meta for the table
    Table meta has information about:
      - number of columns in the table
      - number of rows in the table
      - the number of columns that contains headers
      - the number of rows that contains headers
**/
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
      
    return {rows: rowCount, columns: columnCount, columnOffset: columnOffset, rowOffset: rowOffset};    
}
