import type { Meta, StoryFn } from '@storybook/react';
import { ActionItemIcon } from './ActionItemIcon';
import * as ActionItemIcons from './ActionItemIcons';
import React from 'react';

const meta: Meta<typeof ActionItemIcon> = {
  component: ActionItemIcon,
  title: 'Components/ActionItemIcon',
};
export default meta;

export const Variants: StoryFn<typeof ActionItemIcon> = () => {
  const actionItemIcons = Object.keys(ActionItemIcons);

  return (
    <>
      {actionItemIcons.map((actionItemIcon) => {
        return (
          <div
            key={actionItemIcon}
            style={{
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              margin: '10px',
              gap: '10px',
            }}
          >
            <ActionItemIcon
              largeIconName={actionItemIcon as keyof typeof ActionItemIcons}
            />
            {actionItemIcon}
          </div>
        );
      })}
    </>
  );
};
