import {
  ActionDispatch,
  createContext,
  ReactNode,
  useMemo,
  useReducer,
} from 'react';

import {
  ActionType,
  ReducerActionTypes,
  StartPageState,
} from '../pages/StartPage/StartPageTypes';
import {
  getFilters,
  getTimeUnits,
  updateSubjectTreeCounts,
  flattenSubjectTreeToList,
  getYearRanges,
} from '../util/startPageFilters';
import { shouldTableBeIncluded } from '../util/tableHandler';

// Want to ensure this is never changed
const initialState: StartPageState = Object.freeze({
  availableTables: [],
  filteredTables: [],
  availableFilters: getFilters([]),
  activeFilters: [],
  loading: false,
  error: '',
  originalSubjectTree: [],
  subjectOrderList: [],
  lastUsedYearRange: null,
});

export const FilterContext = createContext<{
  state: StartPageState;
  dispatch: ActionDispatch<[action: ReducerActionTypes]>;
}>({
  state: initialState,
  dispatch: () => null,
});

interface FilterProviderProps {
  children: ReactNode;
}

export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
}: FilterProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const memoizedState = useMemo(() => {
    return { state, dispatch };
  }, [state]);

  return (
    <FilterContext.Provider value={memoizedState}>
      {children}
    </FilterContext.Provider>
  );
};

function reducer(
  state: StartPageState,
  action: ReducerActionTypes,
): StartPageState {
  switch (action.type) {
    case ActionType.RESET_FILTERS: {
      const fullRange = getYearRanges(action.payload.tables);
      const subjectOrder = flattenSubjectTreeToList(action.payload.subjects);
      return {
        ...initialState,
        availableTables: action.payload.tables,
        filteredTables: action.payload.tables,
        originalSubjectTree: action.payload.subjects,
        subjectOrderList: subjectOrder,
        availableFilters: {
          subjectTree: action.payload.subjects,
          timeUnits: getTimeUnits(action.payload.tables),
          yearRange: fullRange,
        },
        lastUsedYearRange: fullRange,
      };
    }
    case ActionType.ADD_FILTER: {
      const incoming = action.payload;
      const incomingTypes = new Set(incoming.map((f) => f.type));
      const clearedFilters = state.activeFilters.filter((f) =>
        incoming[0]?.type === 'yearRange' ? f.type !== 'yearRange' : true,
      );
      const newFilters = [...clearedFilters, ...incoming];
      const filteredTables = state.availableTables.filter((table) =>
        shouldTableBeIncluded(table, newFilters),
      );
      const addType = action.payload[0]?.type;
      const updatedLastUsedYearRange = incomingTypes.has('yearRange')
        ? state.lastUsedYearRange
        : getYearRanges(filteredTables);
      return {
        ...state,
        activeFilters: newFilters,
        filteredTables,
        availableFilters: {
          subjectTree:
            addType !== 'subject'
              ? updateSubjectTreeCounts(
                  state.originalSubjectTree,
                  filteredTables,
                )
              : state.availableFilters.subjectTree,
          timeUnits:
            addType !== 'timeUnit'
              ? getTimeUnits(filteredTables)
              : state.availableFilters.timeUnits,
          yearRange: getYearRanges(filteredTables),
        },
        lastUsedYearRange: updatedLastUsedYearRange,
      };
    }
    case ActionType.REMOVE_FILTER: {
      const removedType = action.payload.type;
      const currentFilters =
        removedType == 'subject' && action.payload.uniqueId
          ? state.activeFilters.filter(
              (filter) => filter.uniqueId !== action.payload.uniqueId,
            )
          : state.activeFilters.filter(
              (filter) => filter.value !== action.payload.value,
            );
      if (currentFilters.length === 0) {
        const fullRange = getYearRanges(state.availableTables);
        return {
          ...state,
          activeFilters: [],
          filteredTables: state.availableTables,
          availableFilters: {
            subjectTree: updateSubjectTreeCounts(
              state.originalSubjectTree,
              state.availableTables,
            ),
            timeUnits: getTimeUnits(state.availableTables),
            yearRange: fullRange,
          },
          lastUsedYearRange: fullRange,
        };
      }
      const filteredTables = state.availableTables.filter((table) =>
        shouldTableBeIncluded(table, currentFilters),
      );
      const yearRangeStillActive = currentFilters.some(
        (f) => f.type === 'yearRange',
      );
      const updatedLastUsedYearRange = yearRangeStillActive
        ? state.lastUsedYearRange
        : getYearRanges(filteredTables);

      return {
        ...state,
        activeFilters: currentFilters,
        filteredTables,
        availableFilters: {
          subjectTree:
            removedType !== 'subject'
              ? updateSubjectTreeCounts(
                  state.originalSubjectTree,
                  filteredTables,
                )
              : state.availableFilters.subjectTree,
          timeUnits: getTimeUnits(filteredTables),
          yearRange: getYearRanges(filteredTables),
        },
        lastUsedYearRange: updatedLastUsedYearRange,
      };
    }
    case ActionType.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    case ActionType.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}
