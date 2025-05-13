import { Table } from '@pxweb2/pxweb2-api-client';
import { PathItem } from '../../util/startPageFilters';

export enum ActionType {
  RESET_FILTERS = 'RESET_FILTERS',
  ADD_FILTER = 'ADD_FILTER',
  REMOVE_FILTER = 'REMOVE_FILTER',
  UPDATE_TABLES = 'UPDATE_TABLES',
  SET_ERROR = 'SET_ERROR',
  SET_LOADING = 'SET_LOADING',
}

export type Filter = {
  type: 'timeUnit' | 'subject';
  value: string;
  label: string;
  index: number;
};

export type StartPageState = {
  availableTables: Table[];
  filteredTables: Table[];
  availableFilters: {
    subjectTree: PathItem[];
    timeUnits: Map<string, number>;
  };
  activeFilters: Filter[];
  loading: boolean;
  error: string;
  originalSubjectTree: PathItem[];
};

export type ReducerActionTypes =
  | ResetFilterAction
  | AddFilterAction
  | RemoveFilterAction
  | UpdateTablesAction
  | SetErrorAction
  | SetLoadingAction;

type RemoveFilterAction = {
  type: ActionType.REMOVE_FILTER;
  payload: string;
};

type ResetFilterAction = {
  type: ActionType.RESET_FILTERS;
  payload: { tables: Table[]; subjects: PathItem[] };
};

type AddFilterAction = {
  type: ActionType.ADD_FILTER;
  payload: Filter[];
};

type UpdateTablesAction = {
  type: ActionType.UPDATE_TABLES;
  payload: Table[];
};

type SetErrorAction = {
  type: ActionType.SET_ERROR;
  payload: string;
};

type SetLoadingAction = {
  type: ActionType.SET_LOADING;
  payload: boolean;
};

export type StartPageFilters = {
  timeUnits: Map<string, number>;
  subjectTree: PathItem[];
};
