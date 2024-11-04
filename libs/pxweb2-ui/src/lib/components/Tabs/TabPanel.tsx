//Adapted from: Juliana Godoy Viana, a11ytabs (MIT licensed, original copyright notice included in copyright_notice.txt)
//Modifications:
//- import TabContext from TabsProvider

import { ReactNode, useContext } from 'react';

import { TabContext } from './TabsProvider';

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
      {...rest}
    >
      {children}
    </div>
  ) : null;
}

export default TabPanel;