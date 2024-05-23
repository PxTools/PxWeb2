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

export function calculateRowAndColumnMeta(): columnRowMeta {
    // Calculate the number of rows and columns
    // ...
    return {rows: 0, columns: 0, columnOffset: 0, rowOffset: 0};    
}
