import React, { createContext, useMemo, useState } from 'react';

import { SelectedVBValues, PxTableMetadata } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../util/config/getConfig';

// Define the type for the context
export type VariablesContextType = {
  isInitialized: boolean;
  addSelectedValues: (variableId: string, values: string[]) => void;
  getSelectedValuesById: (variableId: string) => string[];
  getSelectedValuesByIdSorted: (variableId: string) => string[];
  getSelectedCodelistById: (variableId: string) => string | undefined;
  getNumberOfSelectedValues: () => number;
  getSelectedMatrixSize: () => number;
  getUniqueIds: () => string[];
  syncVariablesAndValues: (
    values: SelectedVBValues[],
    changedVariableId?: string,
    previousValues?: string[],
  ) => void;
  hasLoadedInitialSelection: boolean;
  setHasLoadedInitialSelection: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedVBValues: React.Dispatch<React.SetStateAction<SelectedVBValues[]>>;
  selectedVBValues: SelectedVBValues[];
  isMatrixSizeAllowed: boolean;
  isLoadingMetadata: boolean;
  setIsLoadingMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  pxTableMetadata: PxTableMetadata | null;
  setPxTableMetadata: React.Dispatch<
    React.SetStateAction<PxTableMetadata | null>
  >;
};

// Create the context with default values
export const VariablesContext = createContext<VariablesContextType>({
  isInitialized: false,
  addSelectedValues: () => {
    // No-op: useVariables hook prevents this from being called
  },

  getSelectedValuesById: () => [],
  getSelectedValuesByIdSorted: () => [],
  getSelectedCodelistById: () => undefined,

  getNumberOfSelectedValues: () => 0,
  syncVariablesAndValues: () => {
    // No-op: useVariables hook prevents this from being called
  },
  getSelectedMatrixSize: () => 1,
  getUniqueIds: () => [],

  hasLoadedInitialSelection: false,
  setHasLoadedInitialSelection: () => false,
  setSelectedVBValues: () => [],
  selectedVBValues: [],
  setIsLoadingMetadata: () => false,
  isMatrixSizeAllowed: true,
  isLoadingMetadata: false,
  pxTableMetadata: null,
  setPxTableMetadata: () => null,
});

// Provider component
export const VariablesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isInitialized] = useState(true);
  const [variables, setVariables] = useState<
    Map<string, { id: string; value: string }>
  >(new Map());

  const [pxTableMetadata, setPxTableMetadata] =
    useState<PxTableMetadata | null>(null);

  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [hasLoadedInitialSelection, setHasLoadedInitialSelection] =
    useState(false);
  const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValues[]>(
    [],
  );
  const [selectedMatrixSize, setSelectedMatrixSize] = useState<number>(1);
  const [isMatrixSizeAllowed, setIsMatrixSizeAllowed] = useState<boolean>(true);

  const config = getConfig();

  const createSelectionMap = React.useCallback(
    (selection: SelectedVBValues[]) => {
      const map = new Map<string, { id: string; value: string }>();

      selection.forEach((variable) => {
        if (variable.values.length === 0) {
          map.set(variable.id + '-none-selected', {
            id: variable.id,
            value: 'none-selected',
          });
          return;
        }

        variable.values.forEach((value) => {
          map.set(variable.id + '-' + value, {
            id: variable.id,
            value,
          });
        });
      });

      return map;
    },
    [],
  );

  /**
   * Adds multiple values for a given variable
   */
  const addSelectedValues = React.useCallback(
    (variableId: string, values: string[]) => {
      setVariables((prev) => {
        const newVariables = new Map(prev);
        if (values.length === 0) {
          newVariables.set(variableId + '-none-selected', {
            id: variableId,
            value: 'none-selected',
          });
        } else {
          values.forEach((value) => {
            newVariables.set(variableId + '-' + value, {
              id: variableId,
              value,
            });
          });
        }
        return newVariables;
      });
    },
    [],
  );

  const getSelectedValuesById = React.useCallback(
    (variableId: string) => {
      const values: string[] = [];
      variables.forEach((item) => {
        if (item.id === variableId) {
          values.push(item.value);
        }
      });

      return values;
    },
    [variables],
  );

  // not in use so far, but maybe to use it in TableDataProvdider when update Cube.
  const getSelectedValuesByIdSorted = React.useCallback(
    (variableId: string) => {
      let sortedValues: string[] = [];
      pxTableMetadata?.variables.forEach((item) => {
        if (item.id === variableId) {
          sortedValues = item.values
            .filter((value) =>
              selectedVBValues
                .find((selvar) => selvar.id === variableId)
                ?.values.includes(value.code),
            )
            .map((value) => value.code);
        }
      });
      return sortedValues;
    },
    [pxTableMetadata, selectedVBValues],
  );

  /**
   * Get selected codelist for a given variable by it's id
   *
   * @param variableId
   * @returns selected codelist for the given variable or undefined if not found
   */
  const getSelectedCodelistById = React.useCallback(
    (variableId: string) => {
      const selectedCodelist = selectedVBValues?.find(
        (item) => item.id === variableId,
      )?.selectedCodeList;

      return selectedCodelist;
    },
    [selectedVBValues],
  );

  const getNumberOfSelectedValues = React.useCallback(() => {
    return variables.size;
  }, [variables]);

  const getUniqueIds = React.useCallback(() => {
    const unique = new Set<string>();
    variables.forEach((item) => {
      unique.add(item.id);
    });
    return Array.from(unique);
  }, [variables]);

  /**
   * Checks if newVariables introduces changes to the state.
   * @param newVariables
   * @returns
   */
  const hasChanges = React.useCallback(
    (newVariablesMap: Map<string, { id: string; value: string }>) => {
      if (newVariablesMap.size !== variables.size) {
        return true;
      }

      for (const key of newVariablesMap.keys()) {
        if (!variables.has(key)) {
          return true;
        }
      }

      return false;
    },
    [variables],
  );

  const createSelectedMatrixSize = React.useCallback(
    (selectedValues: SelectedVBValues[]) => {
      let matrixSize = 1;
      let numberOfValues = 1;
      selectedValues.forEach((variable) => {
        if (variable.values.length === 0) {
          numberOfValues = 1;
        } else {
          numberOfValues = variable.values.length;
        }
        matrixSize *= numberOfValues;
      });
      setSelectedMatrixSize(matrixSize);
      const maxAllowedMatrixSize = config.maxDataCells;
      if (matrixSize > maxAllowedMatrixSize) {
        setIsMatrixSizeAllowed(false);
      } else {
        setIsMatrixSizeAllowed(true);
      }
    },
    [config.maxDataCells],
  );

  const syncVariablesAndValues = React.useCallback(
    (
      selection: SelectedVBValues[],
      changedVariableId?: string,
      previousValues?: string[],
    ) => {
      createSelectedMatrixSize(selection);

      if (changedVariableId) {
        const nextVariableSelection = selection.find(
          (variable) => variable.id === changedVariableId,
        );

        setVariables((previousMap) => {
          const nextMap = new Map(previousMap);

          if (previousValues && previousValues.length > 0) {
            previousValues.forEach((value) => {
              nextMap.delete(changedVariableId + '-' + value);
            });
          } else if (previousValues && previousValues.length === 0) {
            nextMap.delete(changedVariableId + '-none-selected');
          } else {
            nextMap.forEach((entry, key) => {
              if (entry.id === changedVariableId) {
                nextMap.delete(key);
              }
            });
          }

          if (nextVariableSelection) {
            if (nextVariableSelection.values.length === 0) {
              nextMap.set(changedVariableId + '-none-selected', {
                id: changedVariableId,
                value: 'none-selected',
              });
            } else {
              nextVariableSelection.values.forEach((value) => {
                nextMap.set(changedVariableId + '-' + value, {
                  id: changedVariableId,
                  value,
                });
              });
            }
          }

          return nextMap;
        });
        return;
      }

      const newSelectionMap = createSelectionMap(selection);
      if (!hasChanges(newSelectionMap)) {
        return;
      }

      setVariables(newSelectionMap);
    },
    [createSelectedMatrixSize, createSelectionMap, hasChanges],
  );

  const getSelectedMatrixSize = React.useCallback(() => {
    return selectedMatrixSize;
  }, [selectedMatrixSize]);

  const memoizedValues = useMemo(
    () => ({
      isInitialized,
      addSelectedValues,
      getNumberOfSelectedValues,
      getSelectedValuesById,
      getSelectedValuesByIdSorted,
      getSelectedCodelistById,
      getUniqueIds,
      getSelectedMatrixSize,
      syncVariablesAndValues,
      hasLoadedInitialSelection,
      setHasLoadedInitialSelection,
      setSelectedVBValues,
      selectedVBValues,
      isMatrixSizeAllowed,
      isLoadingMetadata,
      setIsLoadingMetadata,
      pxTableMetadata,
      setPxTableMetadata,
    }),
    [
      isInitialized,
      addSelectedValues,
      getNumberOfSelectedValues,
      getSelectedValuesById,
      getSelectedValuesByIdSorted,
      getSelectedCodelistById,
      getUniqueIds,
      getSelectedMatrixSize,
      syncVariablesAndValues,
      hasLoadedInitialSelection,
      setHasLoadedInitialSelection,
      setSelectedVBValues,
      selectedVBValues,
      isMatrixSizeAllowed,
      isLoadingMetadata,
      setIsLoadingMetadata,
      pxTableMetadata,
      setPxTableMetadata,
    ],
  );

  return (
    <VariablesContext.Provider value={memoizedValues}>
      {children}
    </VariablesContext.Provider>
  );
};
