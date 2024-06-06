import { SelectedVBValues } from '@pxweb2/pxweb2-ui';
import React, { createContext, useState } from 'react';

// Define the type for the context
export type VariablesContextType = {
  variables: Map<string, { id: string; value: string }>;
  addSelectedVariable: (id: string, value: string) => void;
  addSelectedVariables: (id: string, values: string[]) => void;
  removeSelectedVariable: (id: string, value: string) => void;
  toggleSelectedVariable: (id: string, value: string) => void;
  getSelectedValuesById: (id: string) => string[];
  removeSelectedVariables: (id: string) => void;
  getUniqueIds: () => string[];
  syncVariables: (values: SelectedVBValues[]) => void;
  toString: () => string;
};

// Create the context with default values
export const VariablesContext = createContext<VariablesContextType>({
  variables: new Map(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addSelectedVariable: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addSelectedVariables: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeSelectedVariable: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleSelectedVariable: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getSelectedValuesById: () => [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeSelectedVariables: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  syncVariables: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getUniqueIds: () => [],
  toString: () => '',
});

// Provider component
export const VariablesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [variables, setVariables] = useState<
    Map<string, { id: string; value: string }>
  >(new Map());

  const addSelectedVariable = (id: string, value: string) => {
    setVariables((prev) => new Map(prev).set(id + '-' + value, { id, value }));
  };

  const addSelectedVariables = (id: string, values: string[]) => {
    values.forEach((value) => {
      addSelectedVariable(id, value);
    });
  };

  const getSelectedValuesById = (id: string) => {
    const values: string[] = [];
    variables.forEach((item) => {
      if (item.id === id) {
        values.push(item.value);
      }
    });

    return values;
  };

  const removeSelectedVariable = (id: string, value: string) => {
    setVariables((prev) => {
      const newVariables = new Map(prev);
      newVariables.delete(id + '-' + value);
      return newVariables;
    });
  };

  const removeSelectedVariables = (id: string) => {
    const values = getSelectedValuesById(id);
    values.forEach((value) => {
      removeSelectedVariable(id, value);
    });
  };

  const toggleSelectedVariable = (id: string, value: string) => {
    setVariables((prev) => {
      const newVariables = new Map(prev);
      if (newVariables.has(id + '-' + value)) {
        newVariables.delete(id + '-' + value);
      } else {
        newVariables.set(id + '-' + value, { id, value });
      }
      return newVariables;
    });
  };

  const getUniqueIds = () => {
    const unique = new Set<string>();
    variables.forEach((item) => {
      unique.add(item.id);
    });
    return Array.from(unique);
  };

  /**
   * Checks if newVariables introduces changes to the state.
   * @param newVariables
   * @returns
   */
  const hasChanges = (newVariables: SelectedVBValues[]) => {
    const newVars: Set<string> = new Set();
    newVariables.forEach((variable) => {
      variable.values.forEach((value) => {
        newVars.add(variable.id + '-' + value);
      });
    });

    // If size is different, there is changes
    if (newVars.size !== variables.size) {
      return true;
    }

    // Check if there is a key in variables that is missing in newVars.
    // If it is missing, that means there has been some changes
    variables.forEach((variable, key) => {
      if (!newVars.has(key)) {
        return true;
      }
    });

    // Check if newVars has some key that is missing in variables.
    // If it is missing, that means there has been some changes
    newVars.forEach((val) => {
      if (!variables.has(val)) {
        return true;
      }
    });

    // No changes found
    return false;
  };

  const syncVariables = (variables: SelectedVBValues[]) => {
    if (!hasChanges(variables)) {
      return;
    }
    setVariables(new Map());
    variables.forEach((variable) => {
      addSelectedVariables(variable.id, variable.values);
    });
  };

  const toString = () => {
    let str = '';
    variables.forEach((value) => {
      str += ' ' + value.id + '-' + value.value;
    });
    return str;
  };

  return (
    <VariablesContext.Provider
      value={{
        variables,
        addSelectedVariable,
        addSelectedVariables,
        removeSelectedVariable,
        toggleSelectedVariable,
        getSelectedValuesById,
        removeSelectedVariables,
        getUniqueIds,
        syncVariables,
        toString,
      }}
    >
      {children}
    </VariablesContext.Provider>
  );
};
