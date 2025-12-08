import type { Meta, StoryObj, StoryFn } from '@storybook/react-vite';

import { DetailsSection } from './DetailsSection';
import { Heading } from '../Typography/Heading/Heading';
import { BodyLong } from '../Typography/BodyLong/BodyLong';
import { Link } from '../Link/Link';

const meta: Meta<typeof DetailsSection> = {
  component: DetailsSection,
  title: 'Components/DetailsSection',
};
export default meta;

type Story = StoryObj<typeof DetailsSection>;

const text =
  'Metadata oppdateres hver dag klokken 05:00 og 11:30. Dette gjør alle tabeller midlertidig utilgjengelige i opptil fem minutter. Publiserte tall som skal revideres vises som « . » eller « 0 » i tidsrommet klokken 05:00–8:00.';

const exampleContent = (
  <div>
    <Heading size="xsmall">Oppdatering av metadata</Heading>
    <BodyLong>{text}</BodyLong>
    <br />
    <Heading size="xsmall">Relevante lenker</Heading>
    <Link href="#" icon="FileText" iconPosition="start" size="medium">
      Endringer i tabeller
    </Link>
    <br />
    <Link href="#" icon="FileText" iconPosition="start" size="medium">
      Tabeller som bruker ny regioninndeling også for årene før 2024
    </Link>
    <br />
    <Link href="#" icon="InformationCircle" iconPosition="start" size="medium">
      Kom i gang med Statistikkbanken
    </Link>
    <br />
    <Link href="#" icon="FileCode" iconPosition="start" size="medium">
      Kom i gang med API
    </Link>
  </div>
);

export const Default: Story = {
  args: {
    header: 'More about something',
    children: 'Some content',
  },
};

export const WithContent: StoryFn<typeof DetailsSection> = () => {
  return (
    <DetailsSection header="Mer om Statistikkbanken">
      {exampleContent}
    </DetailsSection>
  );
};
