import { Table } from '@pxweb2/pxweb2-api-client';

export enum ActionType {
  RESET_FILTERS = 'RESET_FILTERS',
  ADD_FILTER = 'ADD_FILTER',
}

export type Filter = {
  type: 'text' | 'category' | 'timeUnit' | 'path' | 'variableName';
  value: string;
};

export type State = {
  tables: Table[];
  availableFilters: Map<string, number>;
  activeFilters: Filter[];
};

export type ReducerActionTypes = ResetFilterAction | AddFilterAction;

type ResetFilterAction = {
  type: ActionType.RESET_FILTERS;
};

type AddFilterAction = {
  type: ActionType.ADD_FILTER;
  payload: Filter[];
};
