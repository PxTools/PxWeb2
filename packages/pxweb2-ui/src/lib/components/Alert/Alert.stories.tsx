import type { Meta, StoryFn } from '@storybook/react';

import { Alert } from './Alert';
import { Link } from '../Link/Link';

const meta: Meta<typeof Alert> = {
  component: Alert,
  title: 'Components/Alert',
  parameters: {
    layout: 'padded',
  },
};
export default meta;

export const Variant = {
  args: {
    variant: 'info',
    heading: 'Vi beklager',
    children:
      'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2, beklager så mye',
    onClick: () => {
      alert(
        'Statistikkbanken er for øyeblikket nede. Vi jobber med feilen og forventer å være opp igjen i løpet av ei uke eller 2, beklager så mye ',
      );
    },
  },
};

export const withlink: StoryFn<typeof Alert> = () => {
  return (
    <>
      <br />
      <div style={{ width: '480px' }}>
        <Alert variant="info" closeButton>
          <Link href="https://www.ssb.no" inline>
            SSB
          </Link>
        </Alert>
      </div>
    </>
  );
};

export const withtextandlink: StoryFn<typeof Alert> = () => {
  return (
    <>
      <br />
      <div style={{ width: '480px' }}>
        <Alert variant="info" closeButton>
          Det finnes mer metadata om emnet. Dette kan du lese mer om her:{' '}
          <Link href="https://www.ssb.no" inline>
            SSB
          </Link>
        </Alert>
      </div>
    </>
  );
};
