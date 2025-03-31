import { useReducer } from 'react';
import { Virtuoso } from 'react-virtuoso';

import styles from './StartPage.module.scss';

import { Header } from '../../components/Header/Header';
import { TablesResponse, Table } from '@pxweb2/pxweb2-api-client';
import { Tag } from '@pxweb2/pxweb2-ui';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import {
  type Filter,
  type ReducerActionTypes,
  type State,
  ActionType,
} from './tableTypes';
import list from './dummy-data/tables.json' with { type: 'json' };

const bigTableList = list as TablesResponse;

// TODO:
// - Consider a custom hook for filtering
// - Add a reducer for counting filters
// - Consider: Should the active filters be a map instead of an array?
// - Convert the filter buttons to a checkbox list, and handle the state in the reducer
// - Split up this file into components, and add context provider to supply props to them

function shouldTableBeIncluded(table: Table, filters: Filter[]) {
  return filters.every((filter) => {
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
        const newTables = state.tables.filter((table) => {
          return shouldTableBeIncluded(table, newFilters);
        });
        return {
          ...state,
          activeFilters: newFilters,
          tables: newTables,
          availableFilters: getFilters(newTables),
        };
      case ActionType.REMOVE_FILTER:
        const filterToRemove = action.payload;
        const updatedFilters = state.activeFilters.filter(
          (filter) => filter.value !== filterToRemove.value,
        );
        const filteredTables = bigTableList.tables.filter((table) => {
          return shouldTableBeIncluded(table, updatedFilters);
        });
        return {
          ...state,
          activeFilters: updatedFilters,
          tables: filteredTables,
          availableFilters: getFilters(filteredTables),
        };
      default:
        return state;
    }
  }

  return (
    <AccessibilityProvider>
      <Header />
      {/* <Information /> */}
      <div className={styles.startPage}>
        <div className={styles.sideBar}>
          <h2>Filter</h2>
          <div>
            <button
              onClick={() =>
                handleAddFilter([{ type: 'variableName', value: 'region' }])
              }
            >
              Filter: Only tables with variableName "region"
            </button>
          </div>
          <div>
            <button onClick={handleResetFilter}>Filter: Reset!</button>
          </div>
          <div>
            <h3>Tidsintervall:</h3>
            <ul className={styles.filterList}>
              {Array.from(state.availableFilters).map(([key, value]) => (
                <li
                  key={key}
                  onClick={() =>
                    handleAddFilter([{ type: 'timeUnit', value: key }])
                  }
                >
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
          <p>
            <a href="/table/tab638">Go to table viewer</a>
          </p>
        </div>

        <div className={styles.listTables}>
          <h2>Filtered tables: ({state.tables.length})</h2>
          <div>
            {state.activeFilters.map((filter, index) => (
              <Tag key={index} onClick={() => handleRemoveFilter(filter)}>
                {'X ' + filter.value}
              </Tag>
            ))}
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
