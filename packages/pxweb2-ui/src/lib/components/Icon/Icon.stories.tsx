import type { Meta, StoryFn } from '@storybook/react';
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
  const [color] = React.useState('black');

  return (
    <>
      {icons.map((icon) => {
        return (
          <div
            key={icon}
            style={{
              color: color,
              display: 'flex',
              alignItems: 'center',
              margin: '10px',
              gap: '10px',
            }}
          >
            <Icon iconName={icon as keyof typeof Icons} />

            {icon}
          </div>
        );
      })}
    </>
  );
};
