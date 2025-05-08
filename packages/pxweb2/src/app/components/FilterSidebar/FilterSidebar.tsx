import cl from 'clsx';

import {
  type StartPageState,
  type Filter,
} from '../../pages/StartPage/tableTypes';
import styles from './FilterSidebar.module.scss';

import { Checkbox, FilterCategory } from '@pxweb2/pxweb2-ui';
import { PathItem } from '../../util/startPageFilters';
interface FilterProps {
  state: StartPageState;
  handleAddFilter: (filter: Filter[]) => void;
  handleRemoveFilter: (filter: Filter) => void;
  handleResetFilter: () => void;
}

// MAYBE we can make a new component, which USES the original checkbox, but wraps it with a chevron, and allows children?? And takes in an indentation level? HM!
//

const renderSubjectTreeFilters = (
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
  handleRemoveFilter: (filter: Filter) => void,
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
  handleRemoveFilter: (filter: Filter) => void,
) => {
  return filters.map((subject) => {
    return (
      <div key={subject.id} className={styles.subjectToggle}>
        <Checkbox
          id={subject.id}
          text={subject.label}
          value={state.activeFilters.some((filter) => {
            return filter.type === 'subject' && filter.value === subject.id;
          })}
          onChange={(value) => {
            value
              ? handleAddFilter([
                  { type: 'subject', value: subject.id, label: subject.label },
                ])
              : handleRemoveFilter({
                  type: 'subject',
                  value: subject.id,
                  label: subject.label,
                });
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
  handleRemoveFilter: (filter: Filter) => void,
) => {
  return Array.from(state.availableFilters.timeUnits)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => (
      <li key={key} className={styles.filterItem}>
        <Checkbox
          id={key}
          text={`${key} (${value})`}
          value={state.activeFilters.some(
            (filter) => filter.type === 'timeUnit' && filter.value === key,
          )}
          onChange={(value) => {
            value
              ? handleAddFilter([{ type: 'timeUnit', value: key, label: key }])
              : handleRemoveFilter({
                  type: 'timeUnit',
                  value: key,
                  label: key,
                });
          }}
        />
      </li>
    ));
};

export const FilterSidebar: React.FC<FilterProps> = ({
  state,
  handleAddFilter,
  handleRemoveFilter,
  handleResetFilter,
}) => {
  return (
    <div className={styles.sideBar}>
      <div>
        <div className={cl(styles['heading-medium'])}>Filtre</div>
        <FilterCategory header="Emner">
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
