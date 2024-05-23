import { PxTableMetadata } from './pxTableMetadata';
import { PxTableData } from './pxTableData';
import { Variable } from './variable';

export type PxTable = {
  metadata: PxTableMetadata;
  data: PxTableData<number>;
  stub: Variable[];
  heading: Variable[];
};
