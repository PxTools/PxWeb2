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
              ? handleAddFilter([{ type: 'timeUnit', value: key }])
              : handleRemoveFilter({ type: 'timeUnit', value: key });
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
      <h2 className={cl(styles['heading-small'])}>Filter</h2>
      <div>
        <button
          onClick={() =>
            handleAddFilter([{ type: 'variableName', value: 'region' }])
          }
        >
          <span className={cl(styles['label-medium'])}>
            Filter: Only tables with variableName "region"
          </span>
        </button>
      </div>
      <div>
        <button onClick={handleResetFilter}>
          <span className={cl(styles['label-medium'])}>Filter: Reset!</span>
        </button>
      </div>
      <div>
        <div className={cl(styles['heading-medium'])}>Filter</div>
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
