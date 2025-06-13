import React, { type ReactNode, useState, useRef } from 'react';
import cl from 'clsx';

import styles from './FilterCategory.module.scss';
import { Icon } from '../Icon/Icon';
import { Heading } from '../Typography/Heading/Heading';

export interface FilterCategoryProps {
  header?: string;
  children?: ReactNode;
  openByDefault?: boolean;
}

export const FilterCategory: React.FC<FilterCategoryProps> = ({
  header,
  children,
  openByDefault = false,
}) => {
  const [isOpen, setIsOpen] = useState(openByDefault);

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className={cl(styles.filterCategory)}>
      <button
        className={cl(styles.filterCategoryHeader)}
        aria-expanded={isOpen ? 'true' : 'false'}
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <Heading size="small" level="3" className={styles.filterCategoryTitle}>
          {header}
        </Heading>
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
        inert={!isOpen}
        ref={contentRef}
      >
        {children}
      </div>
    </div>
  );
};

export default FilterCategory;
