import React from 'react';
import cl from 'clsx';
import styles from './FilterCategory.module.scss';
import Checkbox from '../Checkbox/Checkbox';

interface Item {
  id: string;
  text: string;
  value: boolean;
}

export interface FilterCategoryProps {
  heading?: string;
  items: Item[];
}

export const FilterCategory: React.FC<FilterCategoryProps> = ({
  heading,
  items,
}) => (
  <div className={cl(styles.filterCategory)}>
    <h3>{heading}</h3>
    <div className={cl(styles.filterCategory)}>
      {items.map((it) => (
        <Checkbox
          key={it.id}
          id={it.id}
          text={it.text}
          onChange={() => {
            console.log('hei');
          }}
          value={it.value}
        />
      ))}
    </div>
  </div>
);

export default FilterCategory;
