import { PxTable } from '../../shared-types/pxTable';
import { calculateRowAndColumnMeta, columnRowMeta } from './columnRowMeta';


export interface TableProps {
  pxtable: PxTable
}

export function Table({
  pxtable
}: TableProps) {

  const tableMeta: columnRowMeta = calculateRowAndColumnMeta();

  return (
    <>
    <table>
      <thead>
        {/* For each variable in heading */}
        <tr>
        <th>-</th> {/* If stub.count > 0 */}
        
        {/* For each value in variable */}
        {/* colspan = number of values for the next variable */}
        <th colSpan={3} key="">var1-val1</th> 
        <th colSpan={3} key="">var1-val2</th>
        </tr>
        
      </thead>
      <tbody>
        <tr>
          <th>var3-val1</th> {/* If stub.count > 0 */}
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>--var4-val1</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>
        <tr>
          <th>--var4-val2</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>
        <tr>
          <th>var3-val2</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>--var4-val1</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>
        <tr>
          <th>--var4-val2</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>

      </tbody>
    </table>





    <table>
      <thead>
        <tr>
        <th>-</th>
        <th colSpan={3} key="">var1-val1</th>
        <th colSpan={3} key="">var1-val2</th>
        </tr>
        <tr>
        <th>-</th>
        <th key="">var2-val1</th>
          <th key="">var2-val2</th>
          <th key="">var2-val3</th>
          <th key="">var2-val1</th>
          <th key="">var2-val2</th>
          <th key="">var2-val3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th>var3-val1</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>--var4-val1</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>
        <tr>
          <th>--var4-val2</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>
        <tr>
          <th>var3-val2</th>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <th>--var4-val1</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>
        <tr>
          <th>--var4-val2</th>
          <td>cell1</td>
          <td>cell2</td>
          <td>cell3</td>
          <td>cell4</td>
          <td>cell5</td>
          <td>cell6</td>
        </tr>

      </tbody>
    </table>
    </>
  );
}

export default Table;
