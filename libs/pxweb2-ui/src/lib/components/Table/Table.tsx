import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { getPxTableData } from './cubeHelper';

export interface TableProps {
  pxtable: PxTable;
}

/**
 * Represents the metadata for one dimension of a data cell.
 */
type DataCellMeta = {
  varId: string; // id of variable
  valCode: string; // value code
  varPos: number; // variable position in stored data
};

/**
 * Represents the metadata for multiple dimensions of a data cell.
 */
type DataCellCodes = DataCellMeta[];

export function Table({ pxtable }: TableProps) {
  const tableMeta: columnRowMeta = calculateRowAndColumnMeta(pxtable);
  //console.log({ tableMeta });

  const tableColumnSize: number = tableMeta.columns - tableMeta.columnOffset;
  const headingDataCellCodes = new Array<DataCellCodes>(tableColumnSize); // Contains header variable and value codes for each column in the table
  
  // Create empty metadata structure for the dimensions in the header. 
  // This structure will be filled with metadata when the header is created.
  for (let i = 0; i < tableColumnSize; i++) {
    const datacellCodes: DataCellCodes = new Array<DataCellMeta>(
      pxtable.heading.length
    );
    for (let j = 0; j < pxtable.heading.length; j++) {
      const dataCellMeta: DataCellMeta = { varId: '', valCode: '', varPos: 0 };
      datacellCodes[j] = dataCellMeta; // add empty object
    }
    headingDataCellCodes[i] = datacellCodes;
  }

  console.log({ headingDataCellCodes });

  return (
    <table>
      <thead>{createHeading(pxtable, tableMeta, headingDataCellCodes)}</thead>
      <tbody>{createRows(pxtable, tableMeta, headingDataCellCodes)}</tbody>
    </table>
  );
}


/**
 * Creates the heading rows for the table.
 * 
 * @param table - The PxTable object representing the table data.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param headingDataCellCodes - Empty metadata structure for the dimensions of the header cells.
 * @returns An array of JSX.Element representing the heading rows.
 */
export function createHeading(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes: DataCellCodes[]
): JSX.Element[] {
  // Number of times to add all values for a variable, default to 1 for first header row
  let repetitionsCurrentHeaderLevel = 1;
  let columnSpan = 1;
  const emptyText = '';

  let headerRow: JSX.Element[] = [];
  const headerRows: JSX.Element[] = [];

  // If we have any variables in the stub create a empty cell at top left corner of the table
  if (table.stub.length > 0) {
    headerRow.push(<th rowSpan={table.heading.length}>{emptyText}</th>);
  }

  // Otherwise calculate columnspan start value
  columnSpan = tableMeta.columns - tableMeta.columnOffset;

  // loop trough all the variables in the header 
  for (
    let idxHeadingLevel = 0;
    idxHeadingLevel < table.heading.length;
    idxHeadingLevel++
  ) {
    // Set the column span for the header cells for the current row
    columnSpan = columnSpan / table.heading[idxHeadingLevel].values.length;

    const variable = table.heading[idxHeadingLevel];
    let columnIndex = 0;
    // Repeat for number of times in repetion, first time only once
    for (
      let idxRepetitionCurrentHeadingLevel = 1;
      idxRepetitionCurrentHeadingLevel <= repetitionsCurrentHeaderLevel;
      idxRepetitionCurrentHeadingLevel++
    ) {
      // loop trough all the values for the header variable
      for (let i = 0; i < variable.values.length; i++) {
        headerRow.push(
          <th colSpan={columnSpan}>{variable.values[i].label}</th>
        );
        for (let j = 0; j < columnSpan; j++) {
          // Fill the metadata structure for the dimensions of the header cells
          headingDataCellCodes[columnIndex][idxHeadingLevel].varId =
            variable.id;
          headingDataCellCodes[columnIndex][idxHeadingLevel].valCode =
            variable.values[i].code;
          headingDataCellCodes[columnIndex][idxHeadingLevel].varPos =
            table.data.variableOrder.indexOf(variable.id);
          columnIndex++;
        }
      }
    }

    headerRows.push(<tr>{headerRow}</tr>);

    // Set repetiton for the next header variable
    repetitionsCurrentHeaderLevel *=
      table.heading[idxHeadingLevel].values.length;
    headerRow = [];
  }

  return headerRows;
}

/**
 * Creates an array of JSX elements representing the rows of a table.
 * @param table The PxWeb table.
 * @param tableMeta Metadata of the table structure - rows and columns.
 * @param headingDataCellCodes  Metadata structure for the dimensions of the header cells.
 * @returns An array of JSX elements representing the rows of the table.
 */
export function createRows(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes: DataCellCodes[]
): JSX.Element[] {
  const tableRows: JSX.Element[] = [];
  const datacellCodes: DataCellCodes = new Array<DataCellMeta>();

  if (table.stub.length > 0) {
    createRow(
      0,
      tableMeta.rows - tableMeta.rowOffset,
      table,
      tableMeta,
      datacellCodes,
      headingDataCellCodes,
      tableRows
    );
  } else {
    const tableRow: JSX.Element[] = [];
    fillData(table, tableMeta, datacellCodes, headingDataCellCodes, tableRow);
    tableRows.push(<tr>{tableRow}</tr>);
  }

  return tableRows;
}

/**
 * Creates the rows for the table based on the stub variables.
 * 
 * @param stubIndex - The index of the current stub variable.
 * @param rowSpan - The rowspan for the cells to add in this call.
 * @param table - The PxTable object representing the PxWeb table data.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param stubDataCellCodes - The metadata structure for the dimensions of the stub cells.
 * @param headingDataCellCodes - The metadata structure for the dimensions of the header cells.
 * @param tableRows - An array of JSX.Element representing the rows of the table.
 * @returns An array of JSX.Element representing the rows of the table.
 */
function createRow(
  stubIndex: number,
  rowSpan: number,
  table: PxTable,
  tableMeta: columnRowMeta,
  stubDataCellCodes: DataCellCodes,
  headingDataCellCodes: DataCellCodes[],
  tableRows: JSX.Element[]
): JSX.Element[] {
  // Calculate the rowspan for all the cells to add in this call
  rowSpan = rowSpan / table.stub[stubIndex].values.length;

  let tableRow: JSX.Element[] = [];

  // Loop through all the values in the stub variable
  for (let i = 0; i < table.stub[stubIndex].values.length; i++) {
    const val = table.stub[stubIndex].values[i];
    const cellMeta: DataCellMeta = {
      varId: table.stub[stubIndex].id,
      valCode: val.code,
      varPos: table.data.variableOrder.indexOf(table.stub[stubIndex].id),
    };
    stubDataCellCodes.push(cellMeta);
    // Fix the rowspan
    if (rowSpan === 0) {
      rowSpan = 1;
    }

    tableRow.push(<th>{val.label}</th>);

    // If there are more stub variables that need to add headers to this row
    if (table.stub.length > stubIndex + 1) {
      // make the rest of this row empty
      fillEmpty(tableMeta, tableRow);
      tableRows.push(<tr>{tableRow}</tr>);
      tableRow = [];

      // Create a new row for the next stub
      createRow(
        stubIndex + 1,
        rowSpan,
        table,
        tableMeta,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRows
      );
      stubDataCellCodes.pop();
    } else {
      // If no more stubs need to add headers then fill the row with data
      fillData(
        table,
        tableMeta,
        stubDataCellCodes,
        headingDataCellCodes,
        tableRow
      );
      tableRows.push(<tr>{tableRow}</tr>);
      tableRow = [];
      stubDataCellCodes.pop();
    }
  }

  return tableRows;
}

/**
 * Fills a row with empty cells. This is used when we are not on the last dimension of the stub. No data is available for these cells.
 * 
 * @param tableMeta - The metadata for the table columns and rows.
 * @param tableRow - The array of JSX.Element representing the row of the table.
 */
function fillEmpty(tableMeta: columnRowMeta, tableRow: JSX.Element[]): void {
  const emptyText = '';

  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  for (let i = 0; i < maxCols; i++) {
    tableRow.push(<td>{emptyText}</td>);
  }
}

// Fills a row with data cells
/**
 * Fills a row with data cells.
 * 
 * @param table - The PxTable object representing the PxWeb table.
 * @param tableMeta - The metadata for the table columns and rows.
 * @param stubDataCellCodes - The metadata structure for the dimensions of the stub cells.
 * @param headingDataCellCodes - The metadata structure for the dimensions of the header cells.
 * @param tableRow - The array of JSX.Element representing the row of the table.
 */
function fillData(
  table: PxTable,
  tableMeta: columnRowMeta,
  stubDataCellCodes: DataCellCodes,
  headingDataCellCodes: DataCellCodes[],
  tableRow: JSX.Element[]
): void {
  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  for (let i = 0; i < maxCols; i++) {
    // Merge the metadata structure for the dimensions of the stub and header cells
    const dataCellCodes = stubDataCellCodes.concat(headingDataCellCodes[i]);
    //console.log(dataCellCodes);

    const dimensions: string[] = [];
    // Arrange the dimensons in the right order according to how data is stored is the cube
    for (let j = 0; j < dataCellCodes.length; j++) {
      dimensions[dataCellCodes[j].varPos] = dataCellCodes[j].valCode;
    }

    // Example of how to get data from the cube (men in Stockholm in 1970):
    // const dataValue = getPxTableData(table.data, [
    //   '0180', 
    //   'men',
    //   '1970',
    // ]);

    const dataValue = getPxTableData(table.data.cube, dimensions);
    tableRow.push(<td>{dataValue}</td>);
  }
}

export default Table;
