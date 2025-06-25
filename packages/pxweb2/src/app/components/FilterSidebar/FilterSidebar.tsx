import cl from 'clsx';

import { ActionType } from '../../pages/StartPage/StartPageTypes';
import styles from './FilterSidebar.module.scss';
import { useTranslation } from 'react-i18next';
import { Checkbox, FilterCategory } from '@pxweb2/pxweb2-ui';
import {
  PathItem,
  findAncestors,
  findChildren,
} from '../../util/startPageFilters';
import { FilterContext } from '../../context/FilterContext';
import { ReactNode, useContext, useState } from 'react';

interface CollapsibleProps {
  subject: PathItem;
  index: number;
  count: number;
  isActive: boolean;
  children: ReactNode;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  subject,
  index,
  count,
  isActive,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useContext(FilterContext);

  return (
    <>
      <span className={styles.filterLabel}>
        <Checkbox
          id={subject.id + index}
          text={`${subject.label} (${count})`}
          value={isActive}
          subtle={!isActive && count === 0}
          onChange={(value) => {
            if (value) {
              let relatives: PathItem[] = [];
              relatives.push(
                ...findAncestors(
                  state.availableFilters.subjectTree,
                  subject.id,
                ),
              );
              relatives.push(
                ...findChildren(state.availableFilters.subjectTree, subject.id),
              );

              // Remove parents and children from activeFilters
              state.activeFilters
                .filter(
                  (f) =>
                    f.type === 'subject' &&
                    relatives.some((relative) => f.value === relative.id),
                )
                .forEach((f) => {
                  dispatch({
                    type: ActionType.REMOVE_FILTER,
                    payload: f.value,
                  });
                });

              dispatch({
                type: ActionType.ADD_FILTER,
                payload: [
                  {
                    type: 'subject',
                    value: subject.id,
                    label: subject.label,
                    index: index,
                  },
                ],
              });
              subject.children?.length && setIsOpen(true);
            } else {
              dispatch({
                type: ActionType.REMOVE_FILTER,
                payload: subject.id,
              });
              setIsOpen(false);
            }
          }}
        />
      </span>
      {isOpen && children}
    </>
  );
};

const RenderSubjects: React.FC<{
  firstLevel: boolean;
  subjects: PathItem[];
}> = ({ firstLevel, subjects }) => {
  const { state } = useContext(FilterContext);

  return (
    <ul className={styles.filterList}>
      {subjects.map((subject, index) => {
        const isActive = state.activeFilters.some(
          (filter) => filter.type === 'subject' && filter.value === subject.id,
        );
        const count = subject.count ?? 0;

        return (
          <li
            key={subject.id}
            className={cl(!firstLevel && styles.toggleIndent)}
          >
            <Collapsible
              subject={subject}
              index={index}
              count={count}
              isActive={isActive}
            >
              {subject.children && (
                <RenderSubjects
                  firstLevel={false}
                  subjects={subject.children}
                />
              )}
            </Collapsible>
          </li>
        );
      })}
    </ul>
  );
};

const RenderTimeUnitFilters: React.FC = () => {
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
                  payload: key,
                });
          }}
        />
      </li>
    );
  });
};

export const FilterSidebar: React.FC = () => {
  const { state } = useContext(FilterContext);
  const { t } = useTranslation();

  return (
    <div className={styles.sideBar}>
      <div>
        <FilterCategory header={t('start_page.filter.subject')}>
          <RenderSubjects
            firstLevel={true}
            subjects={state.availableFilters.subjectTree}
          />
        </FilterCategory>
        <FilterCategory header={t('start_page.filter.timeUnit')}>
          <ul className={styles.filterList}>
            <RenderTimeUnitFilters />
          </ul>
        </FilterCategory>
      </div>
      <p>
        <a href="/en/table/tab638">Go to table viewer</a>
      </p>
    </div>
  );
};
