import { Table } from '@pxweb2/pxweb2-api-client';

export enum ActionType {
  RESET_FILTERS = 'RESET_FILTERS',
  ADD_FILTER = 'ADD_FILTER',
  REMOVE_FILTER = 'REMOVE_FILTER',
  UPDATE_TABLES = 'UPDATE_TABLES',
}

export type Filter = {
  type: 'text' | 'category' | 'timeUnit' | 'path' | 'variableName';
  value: string;
};

export type StartPageState = {
  availableTables: Table[];
  filteredTables: Table[];
  availableFilters: Map<string, number>;
  activeFilters: Filter[];
};

export type ReducerActionTypes =
  | ResetFilterAction
  | AddFilterAction
  | RemoveFilterAction
  | UpdateTablesAction;

type RemoveFilterAction = {
  type: ActionType.REMOVE_FILTER;
  payload: { filter: Filter; tables: Table[] };
};

type ResetFilterAction = {
  type: ActionType.RESET_FILTERS;
  payload: Table[];
};

type AddFilterAction = {
  type: ActionType.ADD_FILTER;
  payload: Filter[];
};

type UpdateTablesAction = {
  type: ActionType.UPDATE_TABLES;
  payload: Table[];
};
