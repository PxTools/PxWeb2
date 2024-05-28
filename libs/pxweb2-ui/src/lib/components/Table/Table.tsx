import { table } from 'console';
import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { getPxTableData } from './tableBuilder';

export interface TableProps {
  pxtable: PxTable;
}

type DataCellMeta = {
  varId: string; // id of variable
  valCode: string; // value code
  varPos: number; // variable position in stored data
};
type DataCellCodes = DataCellMeta[];

export function Table({ pxtable }: TableProps) {
  const tableMeta: columnRowMeta = calculateRowAndColumnMeta(pxtable);
  console.log(tableMeta);
  const tableColumnSize: number = tableMeta.columns - tableMeta.columnOffset;
  const headingDataCellCodes = new Array<DataCellCodes>(tableColumnSize);  // Contains header variable and value codes for each column in the table
  for (let i = 0; i < tableColumnSize; i++){
    const datacellCodes:DataCellCodes= new Array<DataCellMeta>(pxtable.heading.length);
    for (let j = 0; j < pxtable.heading.length ; j++){
      const obj:DataCellMeta={varId:"",valCode:"",varPos:0}
      datacellCodes[j] = obj  // add empty object
    }
    headingDataCellCodes[i] = datacellCodes;
  }

  console.log(headingDataCellCodes);
  return (
    <>
      <table>
        <thead>{createHeading(pxtable, tableMeta,headingDataCellCodes)}</thead>
        <tbody>{createRows(pxtable, tableMeta)}</tbody>
      </table>

      <br />

      <table>
        <thead>
          <tr>
            <th>-</th>
            <th colSpan={2} key="">
              var1-val1
            </th>
            <th colSpan={2} key="">
              var1-val2
            </th>
          </tr>
          <tr>
            <th>-</th>
            <th key="">var2-val1</th>
            <th key="">var2-val2</th>
            <th key="">var2-val1</th>
            <th key="">var2-val2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>var3-val1</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <th>--var4-val1</th>
            <td>11</td>
            <td>11</td>
            <td>11</td>
            <td>11</td>
          </tr>
          <tr>
            <th>--var4-val2</th>
            <td>22</td>
            <td>22</td>
            <td>22</td>
            <td>22</td>
          </tr>
          <tr>
            <th>var3-val2</th>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr>
            <th>--var4-val1</th>
            <td>33</td>
            <td>33</td>
            <td>33</td>
            <td>33</td>
          </tr>
          <tr>
            <th>--var4-val2</th>
            <td>44</td>
            <td>44</td>
            <td>44</td>
            <td>44</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export function createHeading(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes:DataCellCodes[]
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

  // loop trough all the variables in the header - ln 572
  for (
    let idxHeadingLevel = 0;
    idxHeadingLevel < table.heading.length;
    idxHeadingLevel++
  ) {
    // Set the column span for the header cells for the current row
    columnSpan = columnSpan / table.heading[idxHeadingLevel].values.length;

    const variable = table.heading[idxHeadingLevel];

    // Repeat for number of times in repetion, first time only once
    for (
      let idxRepetitionCurrentHeadingLevel = 1;
      idxRepetitionCurrentHeadingLevel <= repetitionsCurrentHeaderLevel;
      idxRepetitionCurrentHeadingLevel++
    ) {
      // loop trough all the values for the header variable
      for (let j = 0; j < variable.values.length; j++) {
        headerRow.push(
          <th colSpan={columnSpan}>{variable.values[j].label}</th>
        );
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

export function createRows(
  table: PxTable,
  tableMeta: columnRowMeta
): JSX.Element[] {
  const tableRows: JSX.Element[] = [];

  if (table.stub.length > 0) {
    createRow(
      0,
      tableMeta.rows - tableMeta.rowOffset,
      table,
      tableMeta,
      tableRows
    );
  } else {
    const tableRow: JSX.Element[] = [];
    fillData(table, tableMeta, tableRow);
    tableRows.push(<tr>{tableRow}</tr>);
  }

  return tableRows;
}

function createRow(
  stubIndex: number,
  rowSpan: number,
  table: PxTable,
  tableMeta: columnRowMeta,
  tableRows: JSX.Element[]
): JSX.Element[] {
  // Calculate the rowspan for all the cells to add in this call
  rowSpan = rowSpan / table.stub[stubIndex].values.length;

  let tableRow: JSX.Element[] = [];

  // Loop through all the values in the stub variable
  for (let i = 0; i < table.stub[stubIndex].values.length; i++) {
    const val = table.stub[stubIndex].values[i];
    console.log(val.label);

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
      createRow(stubIndex + 1, rowSpan, table, tableMeta, tableRows);
    } else {
      // If no more stubs need to add headers then fill the row with data
      fillData(table, tableMeta, tableRow);
      tableRows.push(<tr>{tableRow}</tr>);
      tableRow = [];
    }
  }

  return tableRows;
}

// Fills an row with empty cells
function fillEmpty(tableMeta: columnRowMeta, tableRow: JSX.Element[]): void {
  const emptyText = '';

  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  for (let i = 0; i < maxCols; i++) {
    tableRow.push(<td>{emptyText}</td>);
  }
}

// Fills a row with data cells
function fillData(
  table: PxTable,
  tableMeta: columnRowMeta,
  tableRow: JSX.Element[]
): void {
  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  for (let i = 0; i < maxCols; i++) {
    // TODO: Get the right data...
    const dataValue = getPxTableData(table.data, [
      'R_2',
      '2',
      '3',
      '2',
      '1970',
    ]);
    tableRow.push(<td>{dataValue}</td>);
  }
}

export default Table;
