import React, { createContext, useState,useRef } from 'react';

import { SelectedVBValues } from '@pxweb2/pxweb2-ui';
import { PxTableMetadata } from '@pxweb2/pxweb2-ui';

// Define the type for the context
export type VariablesContextType = {
  addSelectedValues: (variableId: string, values: string[]) => void;
  getSelectedValuesById: (variableId: string) => string[];
  getSelectedValuesByIdSorted: (variableId: string) => string[];
  getNumberOfSelectedValues: () => number;
  getUniqueIds: () => string[];
  syncVariablesAndValues: (values: SelectedVBValues[]) => void;
  toString: () => string;
  hasLoadedDefaultSelection: boolean;
  setHasLoadedDefaultSelection: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedVBValues: React.Dispatch<React.SetStateAction<SelectedVBValues[]>>;
  selectedVBValues: SelectedVBValues[];
  isLoadingMetadata: boolean;
  hasFinishedInitialMetadataLoad: boolean;
  isLoadingTable:boolean;
  isFadingTable:boolean,
  setIsLoadingMetadata: React.Dispatch<React.SetStateAction<boolean>>;
  setHasFinishedInitialMetadataLoad: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoadingTable:React.Dispatch<React.SetStateAction<boolean>>;
  setIsFadingTable:React.Dispatch<React.SetStateAction<boolean>>;
  pxTableMetadata: PxTableMetadata | null;
  setPxTableMetadata: React.Dispatch<React.SetStateAction<PxTableMetadata | null>
  >;
};

// Create the context with default values
export const VariablesContext = createContext<VariablesContextType>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  addSelectedValues: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getSelectedValuesById: () => [],
  getSelectedValuesByIdSorted: () => [],
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getNumberOfSelectedValues: () => 0,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  syncVariablesAndValues: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  getUniqueIds: () => [],
  toString: () => '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  hasLoadedDefaultSelection: false,
  isLoadingTable:false,
  isFadingTable:true,
  setHasLoadedDefaultSelection: () => false,
  setSelectedVBValues: () => [],
  selectedVBValues: [],
  setIsLoadingMetadata: () => false,
  setHasFinishedInitialMetadataLoad:() => false,
  setIsLoadingTable:() => false,
  setIsFadingTable:() => true,
  isLoadingMetadata: false,
  hasFinishedInitialMetadataLoad: false,
  pxTableMetadata: null,
  setPxTableMetadata: () => null,
  // pxTableMetaToRender:null
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

  // const [prevTableId, setPrevTableId] = useState('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState<boolean>(false);
  const [hasFinishedInitialMetadataLoad, setHasFinishedInitialMetadataLoad] = useState<boolean>(false);

  
  
  
  const [hasLoadedDefaultSelection, setHasLoadedDefaultSelection] =
    useState(false);
  // const { i18n, t } = useTranslation();
  const [selectedVBValues, setSelectedVBValues] = useState<SelectedVBValues[]>(
    []
  );
  
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [isFadingTable, setIsFadingTable] = useState(true);
  const loadingTimer = useRef<NodeJS.Timeout | null>(null);




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

  // not in use so far, but maybe to use it in TableDataProvdider when update Cube.
  const getSelectedValuesByIdSorted = (variableId: string) => {
    let sortedValues:string[] =[] 
    pxTableMetadata?.variables.forEach((item) => {
      if (item.id === variableId) {
        sortedValues = (item.values.filter((value) =>
          selectedVBValues.find(
            (selvar) => selvar.id === variableId
          )?.values.includes(value.code)).map(value=>value.code)
        );
      }
    });
    return sortedValues
  };

  const getNumberOfSelectedValues = () => {
    return variables.size;
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
    console.log('isFadingTable='+ isFadingTable)
    setIsFadingTable(true);
  };

  const toString = () => {
    let str = '';
    variables.forEach((value) => {
      str += ' ' + value.id + '-' + value.value;
    });
    return str;
  };

    // Start Timer
    const startLoadingTimer = () => {
      if (!loadingTimer.current) {
        loadingTimer.current = setTimeout(() => {
          setIsLoadingTable(true); // Show spinner after 6 seconds
          setIsFadingTable(false); // Stop fading since spinner will be shown
        }, 2000);
      }
    };
  
    // Reset Timer
    const restLoadingTimer = () => {
      if (loadingTimer.current) {
        clearInterval(loadingTimer.current);
        loadingTimer.current = null;
      }
    };

  return (
    <VariablesContext.Provider
      value={{
        addSelectedValues,
        getNumberOfSelectedValues,
        getSelectedValuesById,
        getSelectedValuesByIdSorted,
        getUniqueIds,
        syncVariablesAndValues,
        toString,
        hasLoadedDefaultSelection,
        selectedVBValues,
        setSelectedVBValues,
        isLoadingMetadata,
        hasFinishedInitialMetadataLoad,
        isLoadingTable,
        isFadingTable,
        pxTableMetadata,
        setHasLoadedDefaultSelection,
        setIsLoadingMetadata,
        setIsLoadingTable,
        setIsFadingTable,
        setHasFinishedInitialMetadataLoad,
        setPxTableMetadata,
      }}
    >
      {children}
    </VariablesContext.Provider>
  );
};
