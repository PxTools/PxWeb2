import { t } from 'i18next';
import cl from 'clsx';

import classes from './Table.module.scss';
import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';
import { getPxTableData } from './cubeHelper';

export interface TableProps {
  pxtable: PxTable;
  className?: string;
}

/**
 * Represents the metadata for one dimension of a data cell.
 */
type DataCellMeta = {
  varId: string; // id of variable
  valCode: string; // value code
  varPos: number; // variable position in stored data
  htmlId: string; // id used in th. Will build up the headers attribute for datacells. For accesability
};

/**
 * Represents the metadata for multiple dimensions of a data cell.
 */
type DataCellCodes = DataCellMeta[];

export function Table({ pxtable, className = '' }: TableProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  const tableMeta: columnRowMeta = calculateRowAndColumnMeta(pxtable);

  const tableColumnSize: number = tableMeta.columns - tableMeta.columnOffset;
  const headingDataCellCodes = new Array<DataCellCodes>(tableColumnSize); // Contains header variable and value codes for each column in the table

  // Create empty metadata structure for the dimensions in the header.
  // This structure will be filled with metadata when the header is created.

  // Loop through all columns in the table. i is the column index
  for (let i = 0; i < tableColumnSize; i++) {
    const dataCellCodes: DataCellCodes = new Array<DataCellMeta>(
      pxtable.heading.length
    );

    // Loop through all header variables. j is the header variable index
    for (let j = 0; j < pxtable.heading.length; j++) {
      const dataCellMeta: DataCellMeta = {
        varId: '',
        valCode: '',
        varPos: 0,
        htmlId: '',
      };
      dataCellCodes[j] = dataCellMeta; // add empty object
    }
    headingDataCellCodes[i] = dataCellCodes;
  }

  return (
    <table
      className={cl(classes.table, classes[`bodyshort-medium`]) + cssClasses}
      aria-label={pxtable.metadata.label}
    >
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
 * @returns An array of React.JSX.Element representing the heading rows.
 */
export function createHeading(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes: DataCellCodes[]
): React.JSX.Element[] {
  // Number of times to add all values for a variable, default to 1 for first header row
  let repetitionsCurrentHeaderLevel = 1;
  let columnSpan = 1;
  const emptyText = '';

  let headerRow: React.JSX.Element[] = [];
  const headerRows: React.JSX.Element[] = [];

  // If we have any variables in the stub create a empty cell at top left corner of the table
  if (table.stub.length > 0) {
    headerRow.push(
      <th rowSpan={table.heading.length} key={getNewKey()}>
        {emptyText}
      </th>
    );
  }
  // Otherwise calculate columnspan start value
  columnSpan = tableMeta.columns - tableMeta.columnOffset;

  // loop trough all the variables in the header. idxHeadingLevel is the header variable index
  for (
    let idxHeadingLevel = 0;
    idxHeadingLevel < table.heading.length;
    idxHeadingLevel++
  ) {
    // Set the column span for the header cells for the current row
    columnSpan = columnSpan / table.heading[idxHeadingLevel].values.length;
    const variable = table.heading[idxHeadingLevel];
    let columnIndex = 0;
    // Repeat for number of times in repetion, first time only once. idxRepetitionCurrentHeadingLevel is the repetition counter
    for (
      let idxRepetitionCurrentHeadingLevel = 1;
      idxRepetitionCurrentHeadingLevel <= repetitionsCurrentHeaderLevel;
      idxRepetitionCurrentHeadingLevel++
    ) {
      // loop trough all the values for the header variable
      for (let i = 0; i < variable.values.length; i++) {
        const htmlId: string =
          'H' +
          idxHeadingLevel +
          '.' +
          variable.values[i].code +
          '.I' +
          idxRepetitionCurrentHeadingLevel;
        headerRow.push(
          <th
            id={htmlId}
            scope="col"
            colSpan={columnSpan}
            key={getNewKey()}
            className={cl({
              [classes.firstColNoStub]: i === 0 && idxRepetitionCurrentHeadingLevel===1 && table.stub.length === 0,
            })}
          >
            {variable.values[i].label}
          </th>
        );
        // Repeat for the number of columns in the column span
        for (let j = 0; j < columnSpan; j++) {
          // Fill the metadata structure for the dimensions of the header cells
          headingDataCellCodes[columnIndex][idxHeadingLevel].varId =
            variable.id;
          headingDataCellCodes[columnIndex][idxHeadingLevel].valCode =
            variable.values[i].code;
          headingDataCellCodes[columnIndex][idxHeadingLevel].varPos =
            table.data.variableOrder.indexOf(variable.id);
          headingDataCellCodes[columnIndex][idxHeadingLevel].htmlId = htmlId;
          columnIndex++;
        }
      }
    }

    headerRows.push(<tr key={getNewKey()}>{headerRow}</tr>);

    // Set repetiton for the next header variable
    repetitionsCurrentHeaderLevel *=
      table.heading[idxHeadingLevel].values.length;
    headerRow = [];
  }

  return headerRows;
}

/**
 * Creates an array of React.JSX elements representing the rows of a table.
 * @param table The PxWeb table.
 * @param tableMeta Metadata of the table structure - rows and columns.
 * @param headingDataCellCodes  Metadata structure for the dimensions of the header cells.
 * @returns An array of React.JSX elements representing the rows of the table.
 */
export function createRows(
  table: PxTable,
  tableMeta: columnRowMeta,
  headingDataCellCodes: DataCellCodes[]
): React.JSX.Element[] {
  const tableRows: React.JSX.Element[] = [];
  const datacellCodes: DataCellCodes = new Array<DataCellMeta>();

  if (table.stub.length > 0) {
    createRow(
      0,
      tableMeta.rows - tableMeta.rowOffset,
      0,
      table,
      tableMeta,
      datacellCodes,
      headingDataCellCodes,
      tableRows
    );
  } else {
    const tableRow: React.JSX.Element[] = [];
    fillData(table, tableMeta, datacellCodes, headingDataCellCodes, tableRow);
    tableRows.push(
      <tr key={getNewKey()} className={cl(classes.firstColNoStub)}>
        {tableRow}
      </tr>
    );
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
 * @param tableRows - An array of React.JSX.Element representing the rows of the table.
 * @returns An array of React.JSX.Element representing the rows of the table.
 */
function createRow(
  stubIndex: number,
  rowSpan: number,
  stubIteration: number,
  table: PxTable,
  tableMeta: columnRowMeta,
  stubDataCellCodes: DataCellCodes,
  headingDataCellCodes: DataCellCodes[],
  tableRows: React.JSX.Element[]
): React.JSX.Element[] {
  // Calculate the rowspan for all the cells to add in this call
  rowSpan = rowSpan / table.stub[stubIndex].values.length;

  let tableRow: React.JSX.Element[] = [];

  // Loop through all the values in the stub variable
  for (let i = 0; i < table.stub[stubIndex].values.length; i++) {
    if (stubIndex === 0) {
      stubIteration++;
    }

    const val = table.stub[stubIndex].values[i];
    const cellMeta: DataCellMeta = {
      varId: table.stub[stubIndex].id,
      valCode: val.code,
      varPos: table.data.variableOrder.indexOf(table.stub[stubIndex].id),
      htmlId: 'R.' + stubIndex + val.code + '.I' + stubIteration,
    };
    stubDataCellCodes.push(cellMeta);
    // Fix the rowspan
    if (rowSpan === 0) {
      rowSpan = 1;
    }

    tableRow.push(
      <th
        id={cellMeta.htmlId}
        scope="row"
        role="rowheader"
        className={cl(classes.stub, classes[`stub-${stubIndex}`])}
        key={getNewKey()}
      >
        {val.label}
      </th>
    );

    // If there are more stub variables that need to add headers to this row
    if (table.stub.length > stubIndex + 1) {
      // make the rest of this row empty
      fillEmpty(tableMeta, tableRow);
      tableRows.push(
        <tr
          className={cl({ [classes.firstdim]: stubIndex === 0 })}
          key={getNewKey()}
        >
          {tableRow}
        </tr>
      );
      tableRow = [];

      // Create a new row for the next stub
      createRow(
        stubIndex + 1,
        rowSpan,
        stubIteration,
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
      tableRows.push(<tr key={getNewKey()}>{tableRow}</tr>);
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
 * @param tableRow - The array of React.JSX.Element representing the row of the table.
 */
function fillEmpty(
  tableMeta: columnRowMeta,
  tableRow: React.JSX.Element[]
): void {
  const emptyText = '';

  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  // Loop through all data columns in the table
  for (let i = 0; i < maxCols; i++) {
    tableRow.push(<td key={getNewKey()}>{emptyText}</td>);
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
 * @param tableRow - The array of React.JSX.Element representing the row of the table.
 */
function fillData(
  table: PxTable,
  tableMeta: columnRowMeta,
  stubDataCellCodes: DataCellCodes,
  headingDataCellCodes: DataCellCodes[],
  tableRow: React.JSX.Element[]
): void {
  // Loop through cells that need to be added to the row
  const maxCols = tableMeta.columns - tableMeta.columnOffset;

  // Loop through all data columns in the table

  for (let i = 0; i < maxCols; i++) {
    // Merge the metadata structure for the dimensions of the stub and header cells
    const dataCellCodes = stubDataCellCodes.concat(headingDataCellCodes[i]);
    const datacellIds: string[] = dataCellCodes.map((obj) => obj.htmlId);
    const headers: string = datacellIds
      .toString()
      .replace(new RegExp(',', 'g'), ' ');
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

    tableRow.push(
      <td key={getNewKey()} headers={headers}>
        {t('number.simple_number', { value: dataValue ?? '' })}
      </td>
    ); // TODO: Handle null values
  }
}

let number = 0;

// TODO: Get keys from id:s in the PxTable object
function getNewKey(): string {
  number = number + 1;
  return number.toString();
}
export default Table;
