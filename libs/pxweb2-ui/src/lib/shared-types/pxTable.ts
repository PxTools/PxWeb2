import { PxTableMetadata } from './pxTableMetadata';
import { PxTableData } from './pxTableData';

export type PxTable = {
  metadata: PxTableMetadata;
  data: PxTableData<number>;
};
