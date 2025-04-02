import { useReducer } from 'react';
import { Virtuoso } from 'react-virtuoso';
import cl from 'clsx';

import styles from './StartPage.module.scss';

import { Tag, Search } from '@pxweb2/pxweb2-ui';
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

// TODO:
// - styling - add from component library
// - Consider: Should the active filters be a map instead of an array? Would ensure no duplicates.
// - Filters with no results should also be shown, but with a (0) next to the name!
// - Add a reducer for counting filters? Or just keep drilling them props!
// - Improve Virtuoso styling - maybe add element inside the list
// - Virtuoso: Mau need to add an empty element if list is empty to avoid a bug.

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
        const newFilters = [...state.activeFilters, ...action.payload];
        const newTables = bigTableList.tables.filter((table) => {
          return shouldTableBeIncluded(table, newFilters);
        });
        return {
          ...state,
          activeFilters: newFilters,
          tables: newTables,
        };
      case ActionType.REMOVE_FILTER:
        const filterToRemove = action.payload;
        const updatedFilters = state.activeFilters.filter(
          (filter) => filter.value !== filterToRemove.value, // May need improving - must check for the whole array element to be identical, not just the value
        );
        let filteredTables: Table[];
        if (updatedFilters.length == 0) {
          filteredTables = initialState.tables;
        } else {
          filteredTables = bigTableList.tables.filter((table) => {
            return shouldTableBeIncluded(table, updatedFilters);
          });
        }
        return {
          ...state,
          activeFilters: updatedFilters,
          tables: filteredTables,
        };
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
            {state.activeFilters.map((filter, index) => (
              <span key={index} className={styles.filterPill}>
                <Tag type="border" onClick={() => handleRemoveFilter(filter)}>
                  {'X ' + filter.value}
                </Tag>
              </span>
            ))}
          </div>
          <div className={cl(styles['label-medium'])}>
            {state.activeFilters.length
              ? `Treff på ${state.tables.length} tabeller`
              : `${state.tables.length} tabeller`}
          </div>
          <Virtuoso
            style={{ height: '93%' }}
            data={state.tables}
            itemContent={(_, table: Table) => (
              <div>
                <h3>{table.label}</h3>
                <div>
                  <div>Category: {table.category}</div>
                  <div>Updated: {table.updated}</div>
                  <div>First period: {table.firstPeriod}</div>
                  <div>Last period: {table.lastPeriod}</div>
                  <div>Time unit: {table.timeUnit}</div>
                  <div>Variable names: {table.variableNames.join(', ')}</div>
                </div>
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
