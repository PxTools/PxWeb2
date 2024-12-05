//Adapted from: Juliana Godoy Viana, a11ytabs (MIT licensed, original copyright notice included in copyright_notice.txt)
//Modifications:
// - Replaced children prop with label
// - changed handlekeydown to not set active tab, only focus, when using arrow keys
// - import TabContext from TabsProvider
// - set active tab using space or enter
// - added styling
// - added span for label
// - added motion span to animate tab switching

import React, { useContext } from 'react';
import { motion as m } from 'motion/react';
import cl from 'clsx';

import { TabContext } from './TabsProvider';
import classes from './Tabs.module.scss';

export interface TabProps {
  id: string;
  controls?: string;
  label: string;
}

export function Tab({ id, controls, label, ...rest }: TabProps) {
  const { activeTab, setActiveTab } = useContext(TabContext);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const tabList = event.currentTarget.parentElement;

    if (event.code === 'ArrowRight' || event.code === 'ArrowDown') {
      const nextTab = event.currentTarget.nextElementSibling as HTMLElement;
      if (nextTab) {
        nextTab.focus();
      } else {
        const firstElement = tabList?.firstElementChild as HTMLElement;
        firstElement.focus();
      }
    }

    if (event.code === 'ArrowLeft' || event.code === 'ArrowUp') {
      const previousTab = event.currentTarget
        .previousElementSibling as HTMLElement;
      if (previousTab) {
        previousTab.focus();
      } else {
        const lastChild = tabList?.lastElementChild as HTMLElement;
        lastChild.focus();
      }
    }

    if (event.code === 'Enter' || event.code === 'Space') {
      setActiveTab(id);
    }
  };

  return (
    <button
      type="button"
      role="tab"
      tabIndex={activeTab === id ? 0 : -1}
      aria-selected={activeTab === id ? 'true' : 'false'}
      onClick={() => setActiveTab(id)}
      onKeyDown={(e) => handleKeyDown(e)}
      id={id}
      aria-controls={controls}
      className={cl(classes.tab)}
      {...rest}
    >
      <span className={cl(classes['label-medium'])}>{label}</span>
      {activeTab === id && (
        <m.span
          layoutId="underline"
          className={cl(classes.underline)}
          transition={{ type: 'tween', duration: 0.25 }}
        />
      )}
    </button>
  );
}

export default Tab;
