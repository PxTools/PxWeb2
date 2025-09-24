import { Table } from '@pxweb2/pxweb2-api-client';

export enum ActionType {
  RESET_FILTERS = 'RESET_FILTERS',
  ADD_FILTER = 'ADD_FILTER',
  ADD_SEARCH_FILTER = 'ADD_SEARCH_FILTER',
  REMOVE_FILTER = 'REMOVE_FILTER',
  UPDATE_TABLES = 'UPDATE_TABLES',
  SET_ERROR = 'SET_ERROR',
  SET_LOADING = 'SET_LOADING',
}

export type FilterType =
  | 'subject'
  | 'timeUnit'
  | 'variable'
  | 'yearRange'
  | 'search'
  | 'status';

export type Filter = {
  type: FilterType;
  value: string;
  label: string;
  index: number;
  uniqueId?: string;
};

export type PathItem = {
  id: string;
  label: string;
  children?: PathItem[];
  count?: number;
  uniqueId?: string;
};

export type YearRange = {
  min: number;
  max: number;
};

export type StartPageState = {
  availableTables: Table[];
  filteredTables: Table[];
  availableFilters: StartPageFilters;
  activeFilters: Filter[];
  loading: boolean;
  error: string;
  originalSubjectTree: PathItem[];
  subjectOrderList: string[];
  lastUsedYearRange: YearRange | null;
};

export type ReducerActionTypes =
  | ResetFilterAction
  | AddFilterAction
  | AddSearchFilterAction
  | RemoveFilterAction
  | UpdateTablesAction
  | SetErrorAction
  | SetLoadingAction;

type RemoveFilterAction = {
  type: ActionType.REMOVE_FILTER;
  payload: { value: string; type: FilterType; uniqueId?: string };
};

type ResetFilterAction = {
  type: ActionType.RESET_FILTERS;
  payload: { tables: Table[]; subjects: PathItem[] };
};

type AddFilterAction = {
  type: ActionType.ADD_FILTER;
  payload: Filter[];
};

type AddSearchFilterAction = {
  type: ActionType.ADD_SEARCH_FILTER;
  payload: { text: string; language: string };
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
  variables: Map<string, number>;
  yearRange: YearRange;
  status: Map<'active' | 'discontinued', number>;
};
