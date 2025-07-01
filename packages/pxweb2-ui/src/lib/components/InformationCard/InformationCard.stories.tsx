import type { Meta, StoryObj } from '@storybook/react-vite';
import { InformationCard, InformationCardProps } from './InformationCard';
import BodyLong from '../Typography/BodyLong/BodyLong';

const meta: Meta<typeof InformationCard> = {
  component: InformationCard,
  title: 'Components/InformationCard',
};
export default meta;

type Story = StoryObj<typeof InformationCard>;

export const Default: Story = {
  args: {
    headingText: 'Information card with header',
    icon: 'Book',
    children: (
      <BodyLong size="medium">
        This is an information card with heading.
      </BodyLong>
    ),
  },
  render: (args: InformationCardProps) => <InformationCard {...args} />,
};

export const WithoutHeading: Story = {
  args: {
    icon: 'Book',
    children: (
      <BodyLong size="medium">
        This is an information card without heading.
      </BodyLong>
    ),
  },
  render: (args) => <InformationCard {...args} />,
};

export const WithHeading: Story = {
  args: {
    headingText: 'Information card with header level 1',
    icon: 'Book',
    children: (
      <BodyLong size="medium">
        This is an information card with heading.
      </BodyLong>
    ),
    headingLevel: '1',
  },
  render: (args: InformationCardProps) => <InformationCard {...args} />,
};
