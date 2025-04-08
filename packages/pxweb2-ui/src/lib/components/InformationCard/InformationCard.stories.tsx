import type { Meta, StoryObj } from '@storybook/react';

import { InformationCard, InformationCardProps } from './InformationCard';
import BodyLong from '../Typography/BodyLong/BodyLong';
import Heading from '../Typography/Heading/Heading';

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
    children: 'This is an information card with heading.',
  },
  render: (args: InformationCardProps) => <InformationCard {...args} />,
};

export const WithoutHeading: Story = {
  args: {
    icon: 'Sparkles',
    children: 'This is an information card without heading.',
  },
  render: (args) => <InformationCard {...args} />,
};

export const WithHeadersAndBodylongs: Story = {
  args: {
    headingText: 'Tegnforklaring',
    icon: 'Book',
    children: (
      <div>
        <Heading size="xsmall">( . ) = Ikke mulig å oppgi tall</Heading>
        <BodyLong>
          Tall finnes ikke på dette tidspunktet fordi kategorien ikke var i bruk
          da tallene ble samlet inn.
        </BodyLong>
        <Heading size="xsmall">( .. ) = Tallgrunnlag mangler</Heading>
        <BodyLong>
          Tall er ikke kommet inn i våre databaser eller er for usikre til å
          publiseres.
        </BodyLong>
        <Heading size="xsmall">
          ( : ) = Vises ikke av konfidensialitetshensyn
        </Heading>
        <BodyLong>
          Tall publiseres ikke for å unngå å identifisere personer eller
          virksomheter.
        </BodyLong>
      </div>
    ),
  },
  render: (args) => <InformationCard {...args} />,
};
