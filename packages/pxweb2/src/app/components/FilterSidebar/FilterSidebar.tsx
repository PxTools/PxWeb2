import cl from 'clsx';

import {
  type StartPageState,
  type Filter,
} from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';

import { Checkbox, FilterCategory, Heading } from '@pxweb2/pxweb2-ui';
import { PathItem } from '../../util/startPageFilters';
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

    return (
      <div key={subject.id} className={styles.subjectToggle}>
        <Checkbox
          id={subject.id + index}
          text={`${subject.label} (${count})`}
          value={isActive}
          subtle={!isActive && count === 0}
          onChange={(value) => {
            value
              ? handleAddFilter([
                  {
                    type: 'subject',
                    value: subject.id,
                    label: subject.label,
                    index: index,
                  },
                ])
              : handleRemoveFilter(subject.id);
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
    state.availableTables.map((table) => table.timeUnit ?? 'Ukjent'),
  );

  return Array.from(allTimeUnits)
    .sort((a, b) => {
      const aCount = state.availableFilters.timeUnits.get(a) ?? 0;
      const bCount = state.availableFilters.timeUnits.get(b) ?? 0;
      return bCount - aCount;
    })
    .map((key, i) => {
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
