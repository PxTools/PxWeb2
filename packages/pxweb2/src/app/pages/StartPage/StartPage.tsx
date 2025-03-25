import { useEffect, useState } from 'react';
import { TablesResponse, Table } from '@pxweb2/pxweb2-api-client';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { type Filter } from './tableTypes';
import list from './dummy-data/tables.json' with { type: 'json' };
import prototypeList from './dummy-data/tables-prototype.json' with { type: 'json' };

const tables = list as TablesResponse;
const prototypeTables = prototypeList as TablesResponse;

const StartPage = () => {
  const [countAlder, setCountAlder] = useState(0);
  const [variableNames, setVariableNames] = useState<Array<string>>([]);
  const [ptList, setPtList] = useState<Array<Table>>([]);
  const [filters, setFilters] = useState<Array<Filter>>([]);

  useEffect(() => {
    resetFilters();
  }, []);

  /// Y U NO WORKY!?
  useEffect(() => {
    // dette blir feil men ok vi tester
    filters.forEach((filter) => filterTables(filter));
  }, [filters]);

  function resetFilters() {
    setFilters([]);
    setPtList(prototypeTables.tables);
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

  const filterTables = (filter: Filter) => {
    setPtList(
      prototypeTables.tables.filter((table) => {
        if (filter.type === 'text') {
          return table?.label
            ?.toLowerCase()
            .includes(filter.value.toLowerCase());
        }
        if (filter.type === 'category') {
          return table?.variableNames.includes(filter.value);
        }
        if (filter.type === 'variableName') {
          return table.variableNames.includes(filter.value);
        }
        return false;
      }),
    );
  };

  return (
    <AccessibilityProvider>
      <div>
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
            onClick={() => setFilters([{ type: 'category', value: 'region' }])}
          >
            Filter: Only "Region" tables
          </button>
        </div>
        <div>
          <button onClick={resetFilters}>Filter: Reset!</button>
        </div>
        <p>
          The available variableNames are:
          <ul>
            {variableNames.map((variableName, index) => (
              <li key={index}>{variableName}, </li>
            ))}
          </ul>
        </p>
        <div>
          <h2>Prototype tables</h2>
          {ptList.map((table, index) => (
            <div key={index}>
              <h3>{table.label}</h3>
              <p>
                <div>Description: {table.description}</div>
                <div>Category: {table.category}</div>
                <div>Updated: {table.updated}</div>
                <div>First period: {table.firstPeriod}</div>
                <div>Last period: {table.lastPeriod}</div>
                {/* <div>Time unit: {table.timeUnit}</div> */}
                <div>Variable names: {table.variableNames.join(', ')}</div>
              </p>
            </div>
          ))}
        </div>
        <p>
          <a href="/table/tab638">Go to table viewer</a>
        </p>
      </div>
    </AccessibilityProvider>
  );
};

export default StartPage;
