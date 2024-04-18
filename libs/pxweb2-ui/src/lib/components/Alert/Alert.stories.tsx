import type { Meta, StoryFn } from '@storybook/react';

import { Alert } from './Alert';
import { Link } from '../Link/Link';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Alert',
};
export default meta;

export const Variant = {
  args: {
    variant: 'info',
    Heading: 'Vi beklager',
    children:
      'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2',
    // description:
    //   'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2',
    onClick: () => {
      alert(
        'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2'
      );
    },
  },
};

export const withlink: StoryFn<typeof Alert> = () => {
  return (
    <>
      <br />
      <Alert variant="info" closeButton description="Hallo" hasheading>
        <Link href="http://www.ssb.no">SSB</Link>
      </Alert>
    </>
  );
};

export const withtextandlink: StoryFn<typeof Alert> = () => {
  return (
    <>
      <br />
      <Alert variant="info" closeButton description="Hallo" hasheading>
        Det finnes mer metadata om emnet. Dette kan du lese mer om her:{' '}
        <Link href="http://www.ssb.no" inline>
          SSB
        </Link>
      </Alert>
    </>
  );
};
