import { useReducer } from 'react';
import { Virtuoso } from 'react-virtuoso';
import cl from 'clsx';

import styles from './StartPage.module.scss';

import { Tag, Search, TableCard, Icon } from '@pxweb2/pxweb2-ui';
import { TablesResponse, Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { Header } from '../../components/Header/Header';
import { Information } from '../../components/Information/Information';
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar';
import {
  type Filter,
  type ReducerActionTypes,
  type State,
  ActionType,
} from './tableTypes';

import list from './dummy-data/tables.json' with { type: 'json' };

const bigTableList = list as TablesResponse;

function shouldTableBeIncluded(table: Table, filters: Filter[]) {
  return filters.some((filter) => {
    if (filter.type === 'text') {
      return table.label?.toLowerCase().includes(filter.value.toLowerCase());
    }
    if (filter.type === 'variableName') {
      return table.variableNames.includes(filter.value);
    }
    if (filter.type === 'timeUnit') {
      return table?.timeUnit?.toLowerCase() === filter.value.toLowerCase();
    }
    return false;
  });
}

function getFilters(tables: Table[]): Map<string, number> {
  const filters = new Map<string, number>();
  tables.forEach((table) => {
    const timeUnit = table.timeUnit ?? 'unknown';
    if (table.timeUnit) {
      filters.set(timeUnit, (filters.get(timeUnit) ?? 0) + 1);
    }
  });
  return filters;
}

// TODO: Remove this function. We can not consider norwegian special cases in our code!
function removeTableNumber(title: string): string {
  //Check if title starts with table number, like "01234: Some Statistic"
  const test = RegExp(/^\d{5}:*./, 'i');

  if (test.exec(title) == null) {
    return title;
  } else {
    return title.slice(6);
  }
}

const initialState: State = {
  tables: bigTableList.tables,
  availableFilters: getFilters(bigTableList.tables),
  activeFilters: [],
};

const StartPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleResetFilter() {
    dispatch({ type: ActionType.RESET_FILTERS });
  }

  function handleAddFilter(filter: Filter[]) {
    dispatch({ type: ActionType.ADD_FILTER, payload: filter });
  }

  function handleRemoveFilter(filter: Filter) {
    dispatch({ type: ActionType.REMOVE_FILTER, payload: filter });
  }

  function reducer(
    state: StartPageState,
    action: ReducerActionTypes,
  ): StartPageState {
    switch (action.type) {
      case ActionType.RESET_FILTERS:
        return initialState;
      case ActionType.ADD_FILTER:
        return {
          ...state,
          activeFilters: [...state.activeFilters, ...action.payload],
          tables: bigTableList.tables.filter((table) => {
            return shouldTableBeIncluded(table, [
              ...state.activeFilters,
              ...action.payload,
            ]);
          }),
        };
      case ActionType.REMOVE_FILTER:
        if (state.activeFilters.length <= 1) {
          return initialState;
        } else {
          return {
            ...state,
            activeFilters: state.activeFilters.filter(
              (filter) => filter.value !== action.payload.value,
            ),
            tables: bigTableList.tables.filter((table) => {
              return shouldTableBeIncluded(
                table,
                state.activeFilters.filter(
                  (filter) => filter.value !== action.payload.value,
                ),
              );
            }),
          };
        }
      default:
        return state;
    }
  }

  return (
    <AccessibilityProvider>
      <Header />
      <Information />
      <div className={styles.startPage}>
        <div className={styles.searchArea}>
          <Search searchPlaceHolder="Search..." variant="default" />
        </div>
        <FilterSidebar
          state={state}
          handleAddFilter={handleAddFilter}
          handleRemoveFilter={handleRemoveFilter}
          handleResetFilter={handleResetFilter}
        />
        <div className={styles.listTables}>
          <div className={styles.filterPillContainer}>
            {state.activeFilters.length >= 2 && (
              <span className={styles.filterPill}>
                <Tag
                  type="border"
                  variant="info"
                  onClick={() => handleResetFilter()}
                >
                  {'Reset Filters'}
                </Tag>
              </span>
            )}
            {state.activeFilters.map((filter) => (
              <span key={filter.value} className={styles.filterPill}>
                <Tag type="border" onClick={() => handleRemoveFilter(filter)}>
                  {'X ' + filter.value}
                </Tag>
              </span>
            ))}
          </div>
          <div className={cl(styles['label-medium'], styles.countLabel)}>
            {state.activeFilters.length
              ? `Treff på ${state.tables.length} tabeller`
              : `${state.tables.length} tabeller`}
          </div>
          <Virtuoso
            style={{ height: '90%' }}
            data={state.tables}
            itemContent={(_, table: Table) => (
              <div className={styles.tableListItem}>
                <TableCard
                  title={`${table.label && removeTableNumber(table.label)}`}
                  href={`/table/${table.id}`}
                  updatedLabel={table.updated ? 'Sist oppdatert' : undefined}
                  lastUpdated={
                    table.updated
                      ? new Date(table.updated).toLocaleDateString('no') // We may want to get the locale from config!
                      : undefined
                  }
                  // We use slice here because we _only_ want 4digit year. Sometimes, month is appended in data set.
                  period={`${table.firstPeriod?.slice(0, 4)}-${table.lastPeriod?.slice(0, 4)}`}
                  frequency={`${table.timeUnit}`}
                  tableId={`${table.id}`}
                  icon={<Icon iconName="Heart" />}
                />
              </div>
            )}
          />
        </div>
      </div>
    </AccessibilityProvider>
  );
};

type StartPageState = {
  tables: Table[];
  availableFilters: Map<string, number>;
  activeFilters: Filter[];
};

export default StartPage;
