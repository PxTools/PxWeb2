export type PxTableData = {
  cube: PxData<number>;
  variableOrder: string[];
  isLoaded: boolean;
};

export type PxData<T> = {
  [key: string]: PxData<T> | T;
};
