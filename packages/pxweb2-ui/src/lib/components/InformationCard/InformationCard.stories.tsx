import type { Meta, StoryObj } from '@storybook/react';

import { InformationCard, InformationCardProps } from './InformationCard';
import { Icon } from '../Icon/Icon';

const meta: Meta<typeof InformationCard> = {
  component: InformationCard,
  title: 'Components/InformationCard',
};
export default meta;

type Story = StoryObj<typeof InformationCard>;

export const Default: Story = {
  args: {
    headingText: 'Information card with header',
    headingSize: 'medium',
    icon: 'Book',
    children: 'This is an information card with heading.',
  },
  render: (args: InformationCardProps) => <InformationCard {...args} />,
}

export const WithoutHeading: Story = {
  args: {
    icon: 'Sparkles',
    children: 'This is an information card without heading.',
  },
  render: (args) => <InformationCard {...args} />,
}

export const WithList: Story = {
  args: {
    headingText: 'With header and list withou bullets',
    headingSize: 'medium',
    icon: 'Book',
    children: (
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        <li><strong>( . ) = Ikke mulig å oppgi tall</strong><br />
        Tall finnes ikke på dette tidspunktet fordi kategorien ikke var i bruk da tallene ble samlet inn.</li>
        <li><strong>( .. ) = Tallgrunnlag mangler</strong><br />
        Tall er ikke kommet inn i våre databaser eller er for usikre til å publiseres.</li>
        <li><strong>( : ) = Vises ikke av konfidensialitetshensyn</strong><br />
        Tall publiseres ikke for å unngå å identifisere personer eller virksomheter.</li>
      </ul>
    ),
  },
  render: (args) => <InformationCard {...args} />,
}


export const WithListWithoutHeading: Story = {
  args: {
    icon: 'Book',
    children: (
      <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ul>
    ),
  },
  render: (args) => <InformationCard {...args} />,
}

export const WithIcon: Story = {
  args: {
    headingText: 'Smiley',
    headingSize: 'large',
    icon: 'Book',
    children: <Icon iconName="FaceSmile"  />,
  },
  render: (args) => <InformationCard {...args} />,
}

export const WithImage: Story = {
  args: {
    headingText: 'Sun is shining',
    headingSize: 'medium',
    icon: 'LightBulb',
    children: <span style={{ fontSize: '64px' }}>☀️</span>,
  },
  render: (args) => <InformationCard {...args} />,
}
