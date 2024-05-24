import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';


export interface TableProps {
  pxtable: PxTable
}

export function Table({
  pxtable
}: TableProps) {

  const tableMeta: columnRowMeta = calculateRowAndColumnMeta(pxtable);
  console.log(tableMeta);

  return (
    <>
    <table>
      <thead>
        {createHeading(pxtable, tableMeta)}
      </thead>
      <tbody>
      </tbody>
    </table>


    <br />


     <table>
      <thead>
        <tr>
        <th>-</th>
        <th colSpan={2} key="">var1-val1</th>
        <th colSpan={2} key="">var1-val2</th>
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
          <th>var3-val2</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table> 
    </>
  );
}

export function createHeading(table: PxTable, tableMeta: columnRowMeta): JSX.Element[] {
  // Number of times to add all values for a variable, default to 1 for first header row
  let repetitionsCurrentHeaderLevel = 1;
  let columnSpan = 1;
  const emptyText = "";

  const headerRows: JSX.Element[] = [];
  let headerRow: JSX.Element[] = [];

  // If we have any variables in the stub create a empty cell at top left corner of the table
  if (table.stub.length > 0) {
    headerRow.push(<th rowSpan={table.heading.length}>{emptyText}</th>);
  }

  // Otherwise calculate columnspan start value
  columnSpan = tableMeta.columns - tableMeta.columnOffset;

  // loop trough all the variables in the header - ln 572
  for (let idxHeadingLevel = 0; idxHeadingLevel < table.heading.length; idxHeadingLevel++) {
    // Set the column span for the header cells for the current row
    columnSpan = columnSpan / table.heading[idxHeadingLevel].values.length;

    const variable = table.heading[idxHeadingLevel];

    // Repeat for number of times in repetion, first time only once
    for (let idxRepetitionCurrentHeadingLevel = 1; idxRepetitionCurrentHeadingLevel <= repetitionsCurrentHeaderLevel; idxRepetitionCurrentHeadingLevel++) {
      // loop trough all the values for the header variable
      for (let j = 0; j < variable.values.length; j++) {
        headerRow.push(<th colSpan={columnSpan}>{variable.values[j].label}</th>);
      }
    }

    headerRows.push(<tr>{headerRow}</tr>);

    // Set repetiton for the next header variable
    repetitionsCurrentHeaderLevel *= table.heading[idxHeadingLevel].values.length;
    headerRow = [];
  }
  
  return headerRows;
}

export default Table;
