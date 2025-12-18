import type { Meta, StoryFn } from '@storybook/react-vite';

import { GlobalAlert } from './GlobalAlert';
import { Link } from '../Link/Link';

const meta: Meta<typeof GlobalAlert> = {
  component: GlobalAlert,
  title: 'Components/GlobalAlert',
  parameters: {
    layout: 'padded',
  },
};
export default meta;

export const Variant = {
  args: {
    variant: 'info',
    heading: 'Welcome',
    children:
      "Welcome to the new PxWeb 2.0! We're still improving to help you find and use the numbers you need",
  },
};

export const WithLink: StoryFn<typeof GlobalAlert> = () => {
  return (
    <>
      <br />
      <div style={{ width: '480px' }}>
        <GlobalAlert variant="info" closeButton>
          <Link href="https://www.ssb.no/en/statbank/table/07459/" inline>
            SSB
          </Link>
        </GlobalAlert>
      </div>
    </>
  );
};

export const WithTextAndLink: StoryFn<typeof GlobalAlert> = () => {
  return (
    <>
      <br />
      <div style={{ width: '480px' }}>
        <GlobalAlert variant="info" closeButton>
          Would you like to se this table in the old user interface:{' '}
          <Link href="https://www.ssb.no/en/statbank/table/07459/" inline>
            Old table
          </Link>
        </GlobalAlert>
      </div>
    </>
  );
};
