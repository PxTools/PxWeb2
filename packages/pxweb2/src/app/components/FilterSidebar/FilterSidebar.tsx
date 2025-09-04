import cl from 'clsx';

import { ActionType, PathItem } from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import { Checkbox, FilterCategory, Search } from '@pxweb2/pxweb2-ui';
import { findAncestors, getAllDescendants } from '../../util/startPageFilters';
import { FilterContext } from '../../context/FilterContext';
import { YearRangeFilter } from './YearRangeFilter';
import { ReactNode, useContext, useState } from 'react';
import _ from 'lodash';

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
    <>
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
      </span>
      {isActive && children}
    </>
  );
};

const RenderSubjects: React.FC<{
  firstLevel: boolean;
  subjects: PathItem[];
  onFilterChange?: () => void;
}> = ({ firstLevel, subjects, onFilterChange }) => {
  const { state } = useContext(FilterContext);

  return (
    <ul className={styles.filterList}>
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
                <RenderSubjects
                  firstLevel={false}
                  subjects={subject.children}
                  onFilterChange={onFilterChange}
                />
              )}
            </Collapsible>
          </li>
        );
      })}
    </ul>
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

  return Array.from(allTimeUnits).map((key, i) => {
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

  return (
    <>
      <div className={styles.variablesSearchBox}>
        <Search
          searchPlaceHolder={t('start_page.filter.variabel_search')}
          variant="default"
          onChange={(value) => setVariableSearch(value)}
        />
      </div>
      <ul className={styles.scrollableVariableFilter}>
        {Array.from(state.availableFilters.variables)
          .filter((value) => {
            return value[0].includes(variableSearch);
          })
          .map((item, index) => {
            const isActive = state.activeFilters.some(
              (filter) =>
                filter.type === 'variable' && filter.value === item[0],
            );
            return (
              <li key={item[0]}>
                <Checkbox
                  id={index.toString()}
                  text={`${_.upperFirst(item[0])} (${item[1]})`}
                  value={isActive}
                  onChange={(value) => {
                    value
                      ? dispatch({
                          type: ActionType.ADD_FILTER,
                          payload: [
                            {
                              type: 'variable',
                              value: item[0],
                              label: _.upperFirst(item[0]),
                              index,
                            },
                          ],
                        })
                      : dispatch({
                          type: ActionType.REMOVE_FILTER,
                          payload: { value: item[0], type: 'variable' },
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
    <div className={styles.sideBar}>
      <div className={styles.sideBarWrapper}>
        <FilterCategory header={t('start_page.filter.subject')}>
          <RenderSubjects
            firstLevel={true}
            subjects={state.availableFilters.subjectTree}
            onFilterChange={onFilterChange}
          />
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
  );
};
