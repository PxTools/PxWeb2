import { SelectedVBValues } from '@pxweb2/pxweb2-ui';
import React, { createContext, useState } from 'react';

import { TableService } from '@pxweb2/pxweb2-api-client';
import { PxTableMetadata } from '@pxweb2/pxweb2-ui';
import { mapTableMetadataResponse } from '../../mappers/TableMetadataResponseMapper';
import { mapTableSelectionResponse } from '../../mappers/TableSelectionResponseMapper';
import { useTranslation } from 'react-i18next';

// Define the type for the context
export type VariablesContextType = {
  variables: Map<string, { id: string; value: string }>;
  addSelectedValues: (variableId: string, values: string[]) => void;
  removeSelectedValue: (variableId: string, value: string) => void;
  toggleSelectedValue: (variableId: string, value: string) => void;
  getSelectedValuesById: (variableId: string) => string[];
  getNumberOfSelectedValues: () => number;
  removeSelectedValues: (variableId: string) => void;
  getUniqueIds: () => string[];
  syncVariablesAndValues: (values: SelectedVBValues[]) => void;
  toString: () => string;
  fetchMetaData: (selectedTableId: string) => void;
  hasLoadedDefaultSelection: boolean;
  setSelectedVBValues: React.Dispatch<React.SetStateAction<SelectedVBValues[]>>;
  selectedVBValues: SelectedVBValues[];
  setIsLoadingMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingMetadata: boolean;
  pxTableMetadata: PxTableMetadata | null;
};

// Create the context with default values
export const VariablesContext = createContext<VariablesContextType>({
  variables: new Map(),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addSelectedValues: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeSelectedValue: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggleSelectedValue: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getSelectedValuesById: () => [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getNumberOfSelectedValues: () => 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  removeSelectedValues: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  syncVariablesAndValues: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getUniqueIds: () => [],
  toString: () => '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  fetchMetaData: (selectedTableId: string) => {},
  hasLoadedDefaultSelection: false,
  setSelectedVBValues: () => [],
  selectedVBValues: [],
  setIsLoadingMetadata: () => false,
  isLoadingMetadata: false,
  pxTableMetadata: null,
});

// Provider component
export const VariablesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [variables, setVariables] = useState<
    Map<string, { id: string; value: string }>
  >(new Map());

  const [errorMsg, setErrorMsg] = useState('');
  const [pxTableMetadata, setPxTableMetadata] =
    useState<PxTableMetadata | null>(null);

  const [prevTableId, setPrevTableId] = useState('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [hasLoadedDefaultSelection, setHasLoadedDefaultSelection] =
    useState(false);
  const { i18n, t } = useTranslation();
  const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValues[]>(
    []
  );

  const fetchMetaData = async (tableId: string) => {
    let shouldGetDefaultSelection = !hasLoadedDefaultSelection;

    if (!tableId) {
      return;
    }

    if (prevTableId === '' || prevTableId !== tableId) {
      setHasLoadedDefaultSelection(false);
      shouldGetDefaultSelection = true;
      setPrevTableId(tableId);
    }

    console.log('PROVIDER 22222 IsLoadingMetadata=' + isLoadingMetadata);
    if (isLoadingMetadata === false) {
      setIsLoadingMetadata(true);
    }

    TableService.getMetadataById(tableId, i18n.resolvedLanguage)
      .then((tableMetadataResponse) => {
        const pxTabMetadata: PxTableMetadata = mapTableMetadataResponse(
          tableMetadataResponse
        );
        setPxTableMetadata(pxTabMetadata);

        setErrorMsg('');
      })
      .then(() => {
        if (!shouldGetDefaultSelection) {
          setIsLoadingMetadata(false);

          return;
        }

        TableService.getDefaultSelection(tableId, i18n.resolvedLanguage)
          .then((selectionResponse) => {
            const defaultSelection = mapTableSelectionResponse(
              selectionResponse
            ).filter(
              (variable) =>
                variable.values.length > 0 ||
                variable.selectedCodeList !== undefined
            );
            setSelectedVBValues(defaultSelection);
            syncVariablesAndValues(defaultSelection);
            setIsLoadingMetadata(false);
            setHasLoadedDefaultSelection(true);
            console.log('PROVIDER IsLoadingMetadata=' + isLoadingMetadata);
            console.log(
              'PROVIDER HasLoadedDefaultSelection=' + hasLoadedDefaultSelection
            );
          })
          .catch((error) => {
            setErrorMsg('Error getting default selection: ' + tableId);
          });
        console.log('PROVIDER 2 IsLoadingMetadata=' + isLoadingMetadata);
        console.log(
          'PROVIDER 2 HasLoadedDefaultSelection=' + hasLoadedDefaultSelection
        );
      })
      .catch((error) => {
        setErrorMsg('Could not get table: ' + tableId);
        setPxTableMetadata(null);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  /**
   * Adds multiple values for a given variable
   */
  const addSelectedValues = (variableId: string, values: string[]) => {
    setVariables((prev) => {
      const newVariables = new Map(prev);
      values.forEach((value) => {
        newVariables.set(variableId + '-' + value, { id: variableId, value });
      });
      return newVariables;
    });
  };

  const getSelectedValuesById = (variableId: string) => {
    const values: string[] = [];
    variables.forEach((item) => {
      if (item.id === variableId) {
        values.push(item.value);
      }
    });

    return values;
  };

  const getNumberOfSelectedValues = () => {
    return variables.size;
  };

  const removeSelectedValue = (variableId: string, value: string) => {
    setVariables((prev) => {
      const newVariables = new Map(prev);
      newVariables.delete(variableId + '-' + value);
      return newVariables;
    });
  };

  const removeSelectedValues = (variableId: string) => {
    const values = getSelectedValuesById(variableId);
    values.forEach((value) => {
      removeSelectedValue(variableId, value);
    });
  };

  const toggleSelectedValue = (variableId: string, value: string) => {
    setVariables((prev) => {
      const newVariables = new Map(prev);
      if (newVariables.has(variableId + '-' + value)) {
        newVariables.delete(variableId + '-' + value);
      } else {
        newVariables.set(variableId + '-' + value, { id: variableId, value });
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

  const syncVariablesAndValues = (variables: SelectedVBValues[]) => {
    if (!hasChanges(variables)) {
      return;
    }
    setVariables(new Map());
    variables.forEach((variable) => {
      addSelectedValues(variable.id, variable.values);
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
        addSelectedValues,
        removeSelectedValue,
        toggleSelectedValue,
        removeSelectedValues,
        getNumberOfSelectedValues,
        getSelectedValuesById,
        getUniqueIds,
        syncVariablesAndValues,
        toString,
        fetchMetaData,
        hasLoadedDefaultSelection,
        selectedVBValues,
        setSelectedVBValues,
        setIsLoadingMetadata,
        isLoadingMetadata,
        pxTableMetadata,
      }}
    >
      {children}
    </VariablesContext.Provider>
  );
};
