import { useState, useReducer } from 'react';
import styles from './StartPage.module.scss';

import { Header } from '../../components/Header/Header';
import { TablesResponse, Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { type Filter } from './tableTypes';
import list from './dummy-data/tables.json' with { type: 'json' };
import prototypeList from './dummy-data/tables-prototype.json' with { type: 'json' };

const tables = list as TablesResponse;
const prototypeTables = prototypeList as TablesResponse;

// TODO:
// - Add typing for the reducer action
// - Consider a custom hook for filtering
// - Add a reducer for counting filters
// - Pagination? Hmm.

function shouldTableBeIncluded(table: Table, filters: Filter[]) {
  return filters.some((filter) => {
    if (filter.type === 'text') {
      return table.label?.toLowerCase().includes(filter.value.toLowerCase());
    }
    if (filter.type === 'variableName') {
      return table.variableNames.includes(filter.value);
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

const initialState: {
  tables: Table[];
  availableFilters: Map<string, number>;
  activeFilters: Filter[];
} = {
  tables: prototypeTables.tables,
  availableFilters: getFilters(prototypeTables.tables),
  activeFilters: [],
};

const StartPage = () => {
  const [countAlder, setCountAlder] = useState(0);
  const [variableNames, setVariableNames] = useState<Array<string>>([]);
  const [state, dispatch] = useReducer(reducer, initialState);

  function handleResetFilter() {
    dispatch({ type: 'resetFilters' });
  }

  function handleAddFilter(filter: Filter[]) {
    dispatch({ type: 'addFilter', payload: filter });
  }

  function reducer(state: StartPageState, action) {
    switch (action.type) {
      case 'resetFilters':
        return initialState;
      case 'addFilter':
        const newTables = prototypeTables.tables.filter((table) => {
          return shouldTableBeIncluded(table, action.payload);
        });
        return {
          ...state,
          activeFilters: action.payload,
          tables: newTables,
          availableFilters: getFilters(newTables),
        };
      default:
        return state;
    }
  }

  function doTheCount() {
    console.time('countAlder');

    if (!tables || !('tables' in tables)) {
      console.error('No tables found');
    } else {
      const alderTable = tables.tables.filter((table) =>
        table.variableNames.includes('alder'),
      );
      setCountAlder(alderTable ? alderTable.length : 0);
    }
    console.timeEnd('countAlder');
  }

  function findVariablesFromTables() {
    console.time('findVariables');
    if (!tables || !('tables' in tables)) {
      console.error('No tables found');
    } else {
      const variableNames = tables.tables
        .map((table) => table.variableNames)
        .flat();
      const uniqueVariableNames = [...new Set(variableNames)].sort();
      setVariableNames(uniqueVariableNames);
    }
    console.timeEnd('findVariables');
  }

  return (
    <AccessibilityProvider>
      <Header />
      <div className={styles.startPage}>
        <div className={styles.sideBar}>
          <h1>Start Page</h1>
          <p>This is the start page for the application.</p>
          <p>There are {countAlder} tables available.</p>
          <p>There are {variableNames.length} variables avilable.</p>
          <div>
            <button onClick={doTheCount}>Count tables with Alder</button>
          </div>
          <div>
            <button onClick={findVariablesFromTables}>
              List all the variableNames
            </button>
          </div>
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
            The available timeUnit filters:
            <ul>
              {Array.from(state.availableFilters).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={styles.listTables}>
          <p>
            The available variableNames are:
            <ul>
              {variableNames.map((variableName, index) => (
                <li key={index}>{variableName}, </li>
              ))}
            </ul>
          </p>
          <h2>Prototype tables</h2>
          {state.tables.map((table, index) => (
            <div key={index}>
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
          ))}
          <p>
            <a href="/table/tab638">Go to table viewer</a>
          </p>
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
