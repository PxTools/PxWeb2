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
        state,
        state.availableFilters.subjectTree,
        handleAddFilter,
        handleRemoveFilter,
      )}
    </>
  );
};

const renderSubject = (
  state: StartPageState,
  filters: PathItem[],
  handleAddFilter: (filter: Filter[]) => void,
  handleRemoveFilter: (filterId: string) => void,
) => {
  return filters.map((subject, index) => {
    return (
      <div key={subject.id} className={styles.subjectToggle}>
        <Checkbox
          id={subject.id}
          text={subject.label + (subject.count && ` (${subject.count})`)}
          value={state.activeFilters.some((filter) => {
            return filter.type === 'subject' && filter.value === subject.id;
          })}
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
          // We're doing recursion
          renderSubject(
            state,
            subject.children,
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
  return Array.from(state.availableFilters.timeUnits)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value], i) => (
      <li key={key} className={styles.filterItem}>
        <Checkbox
          id={key}
          text={`${key} (${value})`}
          value={state.activeFilters.some(
            (filter) => filter.type === 'timeUnit' && filter.value === key,
          )}
          onChange={(value) => {
            value
              ? handleAddFilter([
                  { type: 'timeUnit', value: key, label: key, index: i },
                ])
              : handleRemoveFilter(key);
          }}
        />
      </li>
    ));
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
    </div>
  );
};
