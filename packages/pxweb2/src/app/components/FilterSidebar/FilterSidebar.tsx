import cl from 'clsx';

import {
  type StartPageState,
  type Filter,
} from '../../pages/StartPage/tableTypes';
import styles from './FilterSidebar.module.scss';

import { Checkbox } from '@pxweb2/pxweb2-ui';
interface FilterProps {
  state: StartPageState;
  handleAddFilter: (filter: Filter[]) => void;
  handleRemoveFilter: (filter: Filter) => void;
  handleResetFilter: () => void;
}

const renderFilters = (
  state: StartPageState,
  handleAddFilter: (filter: Filter[]) => void,
  handleRemoveFilter: (filter: Filter) => void,
) => {
  return Array.from(state.availableFilters)
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
              ? handleAddFilter([{ type: 'timeUnit', value: key, index: i }])
              : handleRemoveFilter({ type: 'timeUnit', value: key, index: i });
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
      <div>
        <div className={cl(styles['heading-medium'], styles.filterHeading)}>
          Filter
        </div>
        <div className={cl(styles['heading-small'])}>Tidsintervall</div>
        <ul className={styles.filterList}>
          {renderFilters(state, handleAddFilter, handleRemoveFilter)}
        </ul>
      </div>
      <p>
        <a href="/table/tab638">Go to table viewer</a>
      </p>
    </div>
  );
};
