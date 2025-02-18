import React, { ReactNode } from 'react';
import cl from 'clsx';

import classes from './List.module.scss';
interface ListItemProps {
  // nested?: boolean;
  // ordered?: boolean;
  children: ReactNode;
}
export function ListItem({ children, ...rest }: ListItemProps) {
  return (
    <li {...rest} className={cl(classes[`bodylong-medium`])}>
      {children}
    </li>
  );
}

export default ListItem;
