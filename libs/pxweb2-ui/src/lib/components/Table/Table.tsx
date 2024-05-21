import { PxTable } from '../../shared-types/pxTable';
import styles from './Table.module.scss';

export interface TableProps {
  pxtable: PxTable
}

export function Table({
  pxtable
}: TableProps) {
  return (
    <div className={styles['container']}>
      <h1>{pxtable.label}</h1>
    </div>
  );
}

export default Table;
