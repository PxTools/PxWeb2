// import { PxTable } from "./pxTable";

export type PxTableData<T> = {
    [key:string]:PxTableData<T> | T;
}

