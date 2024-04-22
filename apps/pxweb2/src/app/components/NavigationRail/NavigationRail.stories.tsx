import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { NavigationRail } from './NavigationRail';

const meta: Meta<typeof NavigationRail> = {
  component: NavigationRail,
  title: 'Components/NavigationRail',
};
export default meta;

export const NoMargin: StoryFn<typeof NavigationRail> = () => {
  return <NavigationRail />;
};
