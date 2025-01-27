import React from 'react';
import styles from './NavigationRail.module.scss';
import { NavigationItem } from '../NavigationItem/NavigationItemType';
import NavigationBase, {
  NavigationRefs,
} from '../NavigationBase/NavigationBase';

interface NavigationRailProps {
  selected: NavigationItem;
  onChange: (
    keyboard: boolean,
    close: boolean,
    newSelected: NavigationItem,
  ) => void;
}

export const NavigationRail = React.forwardRef<
  NavigationRefs,
  NavigationRailProps
>((props, ref) => {
  return (
    <NavigationBase
      ref={ref}
      {...props}
      parentName="navRail"
      className={styles.navigationRail}
    />
  );
});

export default NavigationRail;
