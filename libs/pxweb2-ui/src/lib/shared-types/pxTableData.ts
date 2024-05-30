export type PxTableData = {
  cube: PxData<number>;
  variableOrder: string[];
};

export type PxData<T> = {
  [key: string]: PxData<T> | T;
};
