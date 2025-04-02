import { type State, type Filter } from '../../pages/StartPage/tableTypes';
import styles from './FilterSidebar.module.scss';

import { Checkbox } from '@pxweb2/pxweb2-ui';
interface FilterProps {
  state: State;
  handleAddFilter: (filter: Filter[]) => void;
  handleRemoveFilter: (filter: Filter) => void;
  handleResetFilter: () => void;
}

export const FilterSidebar: React.FC<FilterProps> = ({
  state,
  handleAddFilter,
  handleRemoveFilter,
  handleResetFilter,
}) => {
  return (
    <div className={styles.sideBar}>
      <h2>Filter</h2>
      <div>
        <button
          onClick={() =>
            handleAddFilter([{ type: 'variableName', value: 'region' }])
          }
        >
          Filter: Only tables with variableName "region"
        </button>
      </div>
      <div>
        <button onClick={handleResetFilter}>Filter: Reset!</button>
      </div>
      <div>
        <h3>Tidsintervall:</h3>
        <ul className={styles.filterList}>
          {Array.from(state.availableFilters).map(([key, value]) => (
            <div key={key} className={styles.filterItem}>
              <Checkbox
                id={key}
                text={`${key}: ${value}`}
                value={state.activeFilters.some(
                  (filter) =>
                    filter.type === 'timeUnit' && filter.value === key,
                )}
                onChange={(value) => {
                  value
                    ? handleAddFilter([{ type: 'timeUnit', value: key }])
                    : handleRemoveFilter({ type: 'timeUnit', value: key });
                }}
              />
            </div>
          ))}
        </ul>
      </div>
      <p>
        <a href="/table/tab638">Go to table viewer</a>
      </p>
    </div>
  );
};
