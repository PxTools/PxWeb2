import type { Meta, StoryFn } from '@storybook/react';
import { Icon } from './Icon';
import * as Icons from './Icons';

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: 'Icon',
};
export default meta;

export const Variants: StoryFn<typeof Icon> = () => {
  const icons = Object.keys(Icons);

  return (
    <>
      {icons.map((icon) => {
        return (
          <div key={icon}>
            <Icon iconName={icon as keyof typeof Icons} />

            {icon}
          </div>
        );
      })}
    </>
  );
};
