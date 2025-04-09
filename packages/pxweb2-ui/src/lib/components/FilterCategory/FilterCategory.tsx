import React, { type ReactNode, useEffect, useState, useRef } from 'react';
import cl from 'clsx';

import styles from './FilterCategory.module.scss';
import { Icon } from '../Icon/Icon';

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
  const [maxHeight, setMaxHeight] = useState('');

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setMaxHeight(isOpen ? `${contentHeight}px` : '');
    }
  }, [isOpen, children]);

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
        ref={contentRef}
        style={{ maxHeight }}
      >
        {children}
      </div>
    </div>
  );
};

export default FilterCategory;
