import type { Meta, StoryObj } from '@storybook/react-vite';
import { LinkCard, LinkCardProps } from './LinkCard';

const meta: Meta<typeof LinkCard> = {
  component: LinkCard,
  title: 'Components/LinkCard',
};
export default meta;

type Story = StoryObj<typeof LinkCard>;

export const Default: Story = {
  args: {
    headingText: 'Link card with header',
    icon: 'Book',
    description: 'This is a medium link card with heading and description.',
    href: 'https://www.ssb.no  ',
  },
  render: (args: LinkCardProps) => <LinkCard {...args} />,
};

export const WithoutHeading: Story = {
  args: {
    icon: 'Book',
    headingText: 'Link card with header',
    description:
      'This is a medium link card without heading, but with description.',
    href: 'https://www.ssb.no  ',
  },
  render: (args) => <LinkCard {...args} />,
};

export const WithHeadingMedium: Story = {
  args: {
    headingText: 'Link card with header level 2',
    icon: 'Book',
    description: 'This is a medium link card with heading and description.',
    headingType: 'h2',
    href: 'https://www.ssb.no  ',
    size: 'medium',
  },
  render: (args: LinkCardProps) => <LinkCard {...args} />,
};

export const WithHeadingSmall: Story = {
  args: {
    headingText: 'Link card with header level 2',
    icon: 'Book',
    description: 'This is a small link card with heading and description.',
    headingType: 'h2',
    size: 'small',
    href: 'https://www.ssb.no  ',
    newTab: true,
  },
  render: (args: LinkCardProps) => <LinkCard {...args} />,
};

export const WithoutDescriptionSmall: Story = {
  args: {
    headingText: 'Link card with header level 2',
    icon: 'Book',
    headingType: 'h2',
    size: 'small',
    href: 'https://www.ssb.no  ',
    newTab: true,
  },
  render: (args: LinkCardProps) => <LinkCard {...args} />,
};

export const WithSpanHeadingMedium: Story = {
  args: {
    headingText: 'Link card with header span',
    icon: 'Book',
    description: 'This is a medium link card with heading and description.',
    headingType: 'span',
    href: 'https://www.ssb.no  ',
    size: 'medium',
  },
  render: (args: LinkCardProps) => <LinkCard {...args} />,
};
export const WithSpanHeadingSmall: Story = {
  args: {
    headingText: 'Link card with header span',
    icon: 'Book',
    description: 'This is a small link card with heading and description.',
    href: 'https://www.ssb.no  ',
    headingType: 'span',
    size: 'small',
  },
  render: (args: LinkCardProps) => <LinkCard {...args} />,
};
