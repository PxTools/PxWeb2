import type { Meta, StoryObj } from '@storybook/react';

import { InformationCard, InformationCardProps } from './InformationCard';


export default {
  title: 'Components/InformationCard',
  component: InformationCard,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
}
