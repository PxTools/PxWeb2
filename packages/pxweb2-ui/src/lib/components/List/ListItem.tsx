import { ReactNode } from 'react';
import cl from 'clsx';

import classes from './List.module.scss';

interface ListItemProps {
  children: ReactNode;
}
export function ListItem({ children, ...rest }: Readonly<ListItemProps>) {
  return (
    <li {...rest} className={cl(classes[`bodylong-medium`])}>
      {children}
    </li>
  );
}

export default ListItem;
