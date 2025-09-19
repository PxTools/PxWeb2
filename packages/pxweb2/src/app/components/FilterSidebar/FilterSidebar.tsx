import cl from 'clsx';

import { ActionType, PathItem } from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import { Checkbox, FilterCategory, Search } from '@pxweb2/pxweb2-ui';
import {
  findAncestors,
  getAllDescendants,
  sortTimeUnit,
} from '../../util/startPageFilters';
import { FilterContext } from '../../context/FilterContext';
import { YearRangeFilter } from './YearRangeFilter';
import { ReactNode, useContext, useState, useMemo } from 'react';
import { upperFirst, debounce } from 'lodash';

interface CollapsibleProps {
  subject: PathItem;
  index: number;
  count: number;
  isActive: boolean;
  children: ReactNode;
  onFilterChange?: () => void;
}
interface FilterSidebarProps {
  onFilterChange?: () => void;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  subject,
  index,
  count,
  isActive,
  children,
  onFilterChange,
}) => {
  const { state, dispatch } = useContext(FilterContext);
  const subjectId = subject.id;
  const subjectLabel = subject.label;
  const subjectTree = state.availableFilters.subjectTree;

  return (
    <span className={styles.filterLabel}>
      <Checkbox
        id={subjectId + index}
        text={`${subjectLabel} (${count})`}
        value={isActive}
        subtle={!isActive && count === 0}
        onChange={(value) => {
          const ancestors = findAncestors(subjectTree, subject.uniqueId!);
          const children = getAllDescendants(subject);

          if (value) {
            // If subject has children, add the subject itself
            dispatch({
              type: ActionType.ADD_FILTER,
              payload: [
                {
                  type: 'subject',
                  value: subjectId,
                  label: subjectLabel,
                  uniqueId: subject.uniqueId,
                  index,
                },
              ],
            });

            // If the subject has children, we remove all ancestors from filter
            for (const ancestor of ancestors) {
              const isAncestorInFilter = state.activeFilters.some(
                (f) => f.type === 'subject' && f.value === ancestor.id,
              );
              if (isAncestorInFilter) {
                dispatch({
                  type: ActionType.REMOVE_FILTER,
                  payload: { value: ancestor.id, type: 'subject' },
                });
              }
            }
          } else {
            //Remove subject and all its descendants from filter
            const descendants = [subject, ...children];

            for (const d of descendants) {
              dispatch({
                type: ActionType.REMOVE_FILTER,
                payload: {
                  value: d.id,
                  type: 'subject',
                  uniqueId: d.uniqueId,
                },
              });
            }

            // Ensure first parent is actually added as a filter, and not just ephemerally selected
            const parent: PathItem | undefined = ancestors.length
              ? ancestors[ancestors.length - 1]
              : undefined;
            const isParentInFilter = state.activeFilters.some(
              (f) => f.type === 'subject' && f.value === parent?.id,
            );
            if (parent && !isParentInFilter) {
              dispatch({
                type: ActionType.ADD_FILTER,
                payload: [
                  {
                    type: 'subject',
                    value: parent.id,
                    label: parent.label,
                    uniqueId: parent.uniqueId,
                    index,
                  },
                ],
              });
            }
          }
          onFilterChange?.();
        }}
      />
      {isActive && children}
    </span>
  );
};

const RenderSubjects: React.FC<{
  firstLevel: boolean;
  subjects: PathItem[];
  onFilterChange?: () => void;
}> = ({ firstLevel, subjects, onFilterChange }) => {
  const { state } = useContext(FilterContext);

  return (
    <>
      {subjects.map((subject, index) => {
        const descendants = getAllDescendants(subject);
        const count = subject.count ?? 0;

        const isChecked =
          state.activeFilters.some(
            (f) => f.type === 'subject' && f.uniqueId === subject.uniqueId,
          ) ||
          descendants.some((d) =>
            state.activeFilters.some(
              (f) => f.type === 'subject' && f.uniqueId === d.uniqueId,
            ),
          );

        return (
          <li
            key={subject.id}
            className={cl(!firstLevel && styles.toggleIndent)}
          >
            <Collapsible
              subject={subject}
              index={index}
              count={count}
              isActive={isChecked}
              onFilterChange={onFilterChange}
            >
              {!!subject.children?.length && (
                <ul className={styles.filterList}>
                  <RenderSubjects
                    firstLevel={false}
                    subjects={subject.children}
                    onFilterChange={onFilterChange}
                  />
                </ul>
              )}
            </Collapsible>
          </li>
        );
      })}
    </>
  );
};

const RenderTimeUnitFilters: React.FC<{ onFilterChange?: () => void }> = ({
  onFilterChange,
}) => {
  const { state, dispatch } = useContext(FilterContext);
  const { t } = useTranslation();

  const allTimeUnits = new Set(
    state.availableTables.map((table) => table.timeUnit ?? ''),
  );
  const sortedTimeUnits = sortTimeUnit(allTimeUnits);

  return Array.from(sortedTimeUnits).map((key, i) => {
    const count = state.availableFilters.timeUnits.get(key) ?? 0;
    const isActive = state.activeFilters.some(
      (filter) => filter.type === 'timeUnit' && filter.value === key,
    );
    const translationKey = `start_page.filter.frequency.${key.toLowerCase()}`;
    const label = t(translationKey, { defaultValue: key });

    return (
      <li key={key} className={styles.filterItem}>
        <Checkbox
          id={key}
          text={`${label} (${count})`}
          value={isActive}
          subtle={!isActive && count === 0}
          onChange={(value) => {
            value
              ? dispatch({
                  type: ActionType.ADD_FILTER,
                  payload: [{ type: 'timeUnit', value: key, label, index: i }],
                })
              : dispatch({
                  type: ActionType.REMOVE_FILTER,
                  payload: { value: key, type: 'timeUnit' },
                });
            onFilterChange?.();
          }}
        />
      </li>
    );
  });
};

const VariablesFilter: React.FC<{ onFilterChange?: () => void }> = ({
  onFilterChange,
}) => {
  const { state, dispatch } = useContext(FilterContext);
  const [variableSearch, setVariableSearch] = useState('');
  const { t } = useTranslation();

  // Compute the filtered list of variables only when either the available variables
  // or the search query changes. The search query is normalized (trimmed + lowercased)
  const filtered = useMemo(() => {
    const query = variableSearch.trim().toLowerCase();
    return Array.from(state.availableFilters.variables).filter(([key]) =>
      key.toLowerCase().includes(query),
    );
  }, [state.availableFilters.variables, variableSearch]);

  return (
    <>
      <div className={styles.variablesSearchBox}>
        <Search
          searchPlaceHolder={t('start_page.filter.variabel_search')}
          variant="default"
          onChange={debounce((value) => setVariableSearch(value), 500)}
        />
      </div>
      <label
        className={styles['sr-only']}
        aria-live="polite"
        aria-atomic="true"
      >
        {t('start_page.filter.variable_count', {
          countShown: filtered.length,
          countTotal: state.availableFilters.variables.size,
        })}
      </label>
      <ul className={styles.scrollableVariableFilter}>
        {filtered.map(([key, count], index) => {
          const isActive = state.activeFilters.some(
            (filter) => filter.type === 'variable' && filter.value === key,
          );
          return (
            <li key={key}>
              <Checkbox
                id={`var-${key}`}
                text={`${upperFirst(key)} (${count})`}
                value={isActive}
                onChange={(value) => {
                  value
                    ? dispatch({
                        type: ActionType.ADD_FILTER,
                        payload: [
                          {
                            type: 'variable',
                            value: key,
                            label: upperFirst(key),
                            index,
                          },
                        ],
                      })
                    : dispatch({
                        type: ActionType.REMOVE_FILTER,
                        payload: { value: key, type: 'variable' },
                      });
                  onFilterChange?.();
                }}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
};

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  onFilterChange,
}) => {
  const { state } = useContext(FilterContext);
  const { t } = useTranslation();

  return (
    <nav aria-label="Filter">
      <div className={styles.sideBar}>
        <div className={styles.sideBarWrapper}>
          <FilterCategory header={t('start_page.filter.subject')}>
            <ul className={styles.filterList}>
              <RenderSubjects
                firstLevel={true}
                subjects={state.availableFilters.subjectTree}
                onFilterChange={onFilterChange}
              />
            </ul>
          </FilterCategory>
          <FilterCategory header={t('start_page.filter.year.title')}>
            <YearRangeFilter onFilterChange={onFilterChange} />
          </FilterCategory>
          <FilterCategory header={t('start_page.filter.timeUnit')}>
            <ul className={styles.filterList}>
              <RenderTimeUnitFilters onFilterChange={onFilterChange} />
            </ul>
          </FilterCategory>
          <FilterCategory header={t('start_page.filter.variabel')}>
            <VariablesFilter onFilterChange={onFilterChange} />
          </FilterCategory>
        </div>
      </div>
    </nav>
  );
};
