//Adapted from: Juliana Godoy Viana, a11ytabs (MIT licensed, original copyright notice included in copyright_notice.txt)
//Modifications:
//- import TabContext from TabsProvider
//- added classname to tabPanel

import { ReactNode, useContext } from 'react';

import { TabContext } from './TabsProvider';
import classes from './Tabs.module.scss';

export interface TabPanelProps {
  id: string;
  controlledBy: string;
  children: ReactNode;
}

export function TabPanel({
  id,
  controlledBy,
  children,
  ...rest
}: TabPanelProps) {
  const { activeTab } = useContext(TabContext);

  return activeTab === controlledBy ? (
    <div
      role="tabpanel"
      id={id}
      aria-labelledby={controlledBy}
      tabIndex={0}
      className={classes.tabPanel}
      {...rest}
    >
      {children}
    </div>
  ) : null;
}

export default TabPanel;
