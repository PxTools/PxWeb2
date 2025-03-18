import { ReactNode } from 'react';
import cl from 'clsx';

import classes from './List.module.scss';

interface ListItemProps {
  children: ReactNode;
  isVariableNote?: boolean;
}
export function ListItem({
  children,
  isVariableNote = false,
  ...rest
}: Readonly<ListItemProps>) {
  return (
    <li
      {...rest}
      className={cl(classes[`bodylong-medium`], {
        [classes[`variableNote`]]: isVariableNote,
      })}
    >
      {children}
    </li>
  );
}

export default ListItem;
