import React, { type ReactNode, useState } from 'react';
import cl from 'clsx';
import styles from './FilterCategory.module.scss';
import { Icon } from '../Icon/Icon';

export interface FilterCategoryProps {
  header?: string;
  children?: ReactNode;
}

export const FilterCategory: React.FC<FilterCategoryProps> = ({
  header,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cl(styles.filterCategory)}>
      <button
        className={cl(styles.filterCategoryHeader)}
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={cl(styles.filterCategoryTitle, styles['heading-small'])}
        >
          {header}
        </span>
        <div className={cl(styles.filterCategoryIconWrapper)}>
          <Icon
            className={cl({
              [styles[`open`]]: isOpen,
            })}
            iconName="ChevronDown"
          />
        </div>
      </button>
      <div
        className={cl(
          styles.filterCategoryContent,
          isOpen ? styles['open'] : styles['closed'],
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default FilterCategory;
