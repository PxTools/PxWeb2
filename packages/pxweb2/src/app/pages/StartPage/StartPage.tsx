import { useState } from 'react';
import { AccessibilityProvider } from '../../context/AccessibilityProvider';
import { type RootObject } from './tableTypes';
import list from './dummy-data/tables.json' with { type: 'json' };

const tables = list as RootObject;

const StartPage = () => {
  const [countAlder, setCountAlder] = useState(0);
  const [variableNames, setVariableNames] = useState<Array<string>>([]);

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
      <div>
        <h1>Start Page</h1>
        <p>This is the start page for the application.</p>
        <p>There are {countAlder} tables available.</p>
        <p>There are {variableNames.length} variables avilable.</p>
        <p>
          The available variableNames are:
          <ul>
            {variableNames.map((variableName, index) => (
              <li key={index}>{variableName}, </li>
            ))}
          </ul>
        </p>
        <div>
          <button onClick={doTheCount}>Count tables with Alder</button>
        </div>
        <div>
          <button onClick={findVariablesFromTables}>
            List all the variableNames
          </button>
        </div>
        <p>
          <a href="/table/tab638">Go to table viewer</a>
        </p>
      </div>
    </AccessibilityProvider>
  );
};

export default StartPage;
