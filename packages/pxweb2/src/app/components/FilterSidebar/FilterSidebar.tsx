import cl from 'clsx';

import {
  type StartPageState,
  type Filter,
} from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';

import {
  Checkbox,
  FilterCategory,
  Heading,
  RangeSlider,
} from '@pxweb2/pxweb2-ui';
import { PathItem, findParent } from '../../util/startPageFilters';
import { YearSelectFilter } from '../YearSelectFilter/YearSelectFilter';
interface FilterProps {
  state: StartPageState;
  handleAddFilter: (filter: Filter[]) => void;
  handleRemoveFilter: (filterId: string) => void;
  handleResetFilter: () => void;
}

const renderSubjectTreeFilters = (
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
  handleRemoveFilter: (filterId: string) => void,
) => {
  return (
    <>
      {renderSubject(
        state.availableFilters.subjectTree,
        state,
        handleAddFilter,
        handleRemoveFilter,
      )}
    </>
  );
};

const renderSubject = (
  subjects: PathItem[],
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
  handleRemoveFilter: (filterId: string) => void,
) => {
  return subjects.map((subject, index) => {
    const isActive = state.activeFilters.some(
      (filter) => filter.type === 'subject' && filter.value === subject.id,
    );
    const count = subject.count ?? 0;

    const handleSubjectAdd = () => {
      const parent = findParent(state.availableFilters.subjectTree, subject.id);

      // Remove parent from activFilters, TODO: mark as indeterminate
      state.activeFilters
        .filter((f) => f.type === 'subject' && f.value === parent?.id)
        .forEach((f) => {
          handleRemoveFilter(f.value);
        });
      handleAddFilter([
        {
          type: 'subject',
          value: subject.id,
          label: subject.label,
          index: index,
        },
      ]);
    };
    const handleSubjectRemove = () => {
      handleRemoveFilter(subject.id);
    };

    return (
      <div key={subject.id} className={styles.subjectToggle}>
        <Checkbox
          id={subject.id + index}
          text={`${subject.label} (${count})`}
          value={isActive}
          subtle={!isActive && count === 0}
          onChange={(value) => {
            value ? handleSubjectAdd() : handleSubjectRemove();
          }}
        />
        {subject.children &&
          renderSubject(
            subject.children,
            state,
            handleAddFilter,
            handleRemoveFilter,
          )}
      </div>
    );
  });
};

const renderTimeUnitFilters = (
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
  handleRemoveFilter: (filterId: string) => void,
) => {
  const allTimeUnits = new Set(
    state.availableTables.map((table) => table.timeUnit ?? ''),
  );

  return Array.from(allTimeUnits).map((key, i) => {
    const count = state.availableFilters.timeUnits.get(key) ?? 0;
    const isActive = state.activeFilters.some(
      (filter) => filter.type === 'timeUnit' && filter.value === key,
    );

    return (
      <li key={key} className={styles.filterItem}>
        <Checkbox
          id={key}
          text={`${key} (${count})`}
          value={isActive}
          subtle={!isActive && count === 0}
          onChange={(value) => {
            value
              ? handleAddFilter([
                  { type: 'timeUnit', value: key, label: key, index: i },
                ])
              : handleRemoveFilter(key);
          }}
        />
      </li>
    );
  });
};

const renderYearFiltersSlider = (
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
) => {
  const activeYearFilter = state.activeFilters.find(
    (f) => f.type === 'yearRange',
  );

  let minYear: number;
  let maxYear: number;

  if (activeYearFilter) {
    const [min, max] = activeYearFilter.value.split('-').map(Number);
    minYear = min;
    maxYear = max;
  } else {
    minYear = state.lastUsedYearRange.min;
    maxYear = state.lastUsedYearRange.max;
  }

  return (
    <div>
      <RangeSlider
        key={`slider-${minYear}-${maxYear}-${state.activeFilters.length}`}
        rangeMin={state.lastUsedYearRange.min}
        rangeMax={state.lastUsedYearRange.max}
        initialMin={minYear}
        initialMax={maxYear}
        minGap={0}
        onChange={({ min, max }) => {
          handleAddFilter([
            {
              type: 'yearRange',
              value: `${min}-${max}`,
              label: `${min} - ${max}`,
              index: 0,
            },
          ]);
        }}
      />
    </div>
  );
};

const renderYearFiltersSelect = (
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
) => {
  return (
    <div>
      <YearSelectFilter
        rangeMin={state.lastUsedYearRange.min}
        rangeMax={state.lastUsedYearRange.max}
        resetYearFilterInput={state.resetYearFilterInput}
        onChange={({ min, max }) =>
          handleAddFilter([
            {
              type: 'yearRange',
              value: `${min}-${max}`,
              label: `${min} - ${max}`,
              index: 0,
            },
          ])
        }
      />
    </div>
  );
};

export const FilterSidebar: React.FC<FilterProps> = ({
  state,
  handleAddFilter,
  handleRemoveFilter,
}) => {
  return (
    <div className={styles.sideBar}>
      <Heading className={cl(styles.filterHeading)} size="medium" level="2">
        Filter
      </Heading>
      <div>
        <FilterCategory header="Emne">
          <ul className={styles.filterList}>
            {renderSubjectTreeFilters(
              state,
              handleAddFilter,
              handleRemoveFilter,
            )}
          </ul>
        </FilterCategory>
        <FilterCategory header="Tidsintervall">
          <ul className={styles.filterList}>
            {renderTimeUnitFilters(state, handleAddFilter, handleRemoveFilter)}
          </ul>
        </FilterCategory>
        <FilterCategory header="År Slider">
          {renderYearFiltersSlider(state, handleAddFilter)}
        </FilterCategory>
        <FilterCategory header="År Select">
          <div className={cl(styles.filterYear)}>
            {renderYearFiltersSelect(state, handleAddFilter)}
          </div>
        </FilterCategory>
      </div>
      <p>
        <a href="/table/tab638">Go to table viewer</a>
      </p>
      <div>
        <button onClick={() => localStorage.removeItem('table')}>
          Tøm Cache
        </button>
      </div>
    </div>
  );
};
