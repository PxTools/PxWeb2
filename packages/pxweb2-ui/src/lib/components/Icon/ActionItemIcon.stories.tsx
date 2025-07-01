import type { Meta, StoryFn } from '@storybook/react-vite';
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
  const [color, setColor] = React.useState('black');

  return (
    <>
      <button onClick={() => setColor('black')}>Black</button>
      <button onClick={() => setColor('red')}>Red</button>
      <button onClick={() => setColor('blue')}>Blue</button>
      {actionItemIcons.map((actionItemIcon) => {
        return (
          <div
            key={actionItemIcon}
            style={{
              color: color,
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
