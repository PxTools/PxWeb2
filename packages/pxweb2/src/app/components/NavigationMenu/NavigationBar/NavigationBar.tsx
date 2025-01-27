import React from 'react';
import styles from './NavigationBar.module.scss';
import { NavigationItem } from '../NavigationItem/NavigationItemType';
import NavigationBase, {
  NavigationRefs,
} from '../NavigationBase/NavigationBase';

interface NavigationBarProps {
  selected: NavigationItem;
  onChange: (
    keyboard: boolean,
    close: boolean,
    newSelected: NavigationItem,
  ) => void;
}

export const NavigationBar = React.forwardRef<
  NavigationRefs,
  NavigationBarProps
>((props, ref) => {
  return (
    <NavigationBase
      ref={ref}
      {...props}
      parentName="navBar"
      className={styles.navigationBar}
    />
  );
});

export default NavigationBar;
