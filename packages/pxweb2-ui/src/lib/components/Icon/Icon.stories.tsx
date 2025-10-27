import type { Meta, StoryFn } from '@storybook/react-vite';
import { Icon } from './Icon';
import * as Icons from './Icons';
import React from 'react';

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: 'Components/Icon',
};
export default meta;

export const Variants: StoryFn<typeof Icon> = () => {
  const icons = Object.keys(Icons);
  const [color, setColor] = React.useState('black');
  return (
    <>
      <button onClick={() => setColor('black')}>Black</button>
      <button onClick={() => setColor('red')}>Red</button>
      <button onClick={() => setColor('blue')}>Blue</button>
      {icons.map((icon) => {
        return (
          <div
            key={icon}
            style={
              {
                color: color,
                '--px-icon-color': color,
                display: 'flex',
                alignItems: 'center',
                margin: '10px',
                gap: '10px',
              } as React.CSSProperties
            }
          >
            <Icon iconName={icon as keyof typeof Icons} />

            {icon}
          </div>
        );
      })}
    </>
  );
};
