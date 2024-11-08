//Adapted from: Juliana Godoy Viana, a11ytabs (MIT licensed, original copyright notice included in copyright_notice.txt)
//Modifications:
// - added prop 'variant' to handle different styling
// - added prop 'LayoutGroupId'
// - made ariaLabelledBy optional
// - added prop 'ariaLabel?'
// - added styling
// - added LayoutGroup from motionframer to restrict unwanted animation if multiple tabs are in use.
// - aria-label/aria-labelledby are set based on aria-prop

import { ReactNode } from 'react';
import { LayoutGroup } from 'framer-motion';
import cl from 'clsx';

import classes from './Tabs.module.scss';

export interface TabsProps {
  variant?: 'fixed' | 'scrollable';
  layoutGroupId?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  children: ReactNode;
}

export function Tabs({
  variant = 'fixed',
  children,
  layoutGroupId,
  ariaLabel,
  ariaLabelledBy,
  ...rest
}: TabsProps) {
  const ariaProps = ariaLabel
    ? { 'aria-label': ariaLabel }
    : { 'aria-labelledby': ariaLabelledBy };
  return (
    <div
      role="tablist"
      className={cl(classes.tabs, classes[variant])}
      {...ariaProps}
      {...rest}
    >
      <LayoutGroup id={layoutGroupId}>{children}</LayoutGroup>
    </div>
  );
}

export default Tabs;
