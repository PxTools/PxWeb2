import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Link } from './Link';
import { BodyLong } from '../Typography/BodyLong/BodyLong';

const meta: Meta<typeof Link> = {
  component: Link,
  title: 'Components/Link',
};
export default meta;

type Story = StoryObj<typeof Link>;

export const variants: Story = {
  args: {
    href: '#',
    children: 'En godt skrevet lenketekst',
  },
};

export const inlineAndStandalone: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Inline link in BodyLong</h1>

      <h2>medium without icon:</h2>
      <BodyLong>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox. Go to{' '}
        <Link href="#" inline>
          Statistikkbanken
        </Link>{' '}
        to read more. This is a story about Little Red Ridinghood. One day she
        went into the wood to visit her grandmother. The day after too, She
        visited her every day, every week, every month, every year. She never
        saw a wolf, no even a little fox.
      </BodyLong>

      <h2>medium icon right:</h2>
      <BodyLong>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox. Go to{' '}
        <Link href="#" inline icon="FileText" iconPosition="right">
          Statistikkbanken
        </Link>{' '}
        to read more This is a story about Little Red Ridinghood. One day she
        went into the wood to visit her grandmother. The day after too, She
        visited her every day, every week, every month, every year. She never
        saw a wolf, no even a little fox.
      </BodyLong>

      <h2>small without icon:</h2>
      <BodyLong size="small">
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox. Go to{' '}
        <Link href="#" inline>
          Statistikkbanken
        </Link>{' '}
        to read more. This is a story about Little Red Ridinghood. One day she
        went into the wood to visit her grandmother. The day after too, She
        visited her every day, every week, every month, every year. She never
        saw a wolf, no even a little fox.
      </BodyLong>

      <h2>small icon right:</h2>
      <BodyLong size="small">
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox. Go to{' '}
        <Link href="#" inline icon="FileText" iconPosition="right">
          Statistikkbanken
        </Link>{' '}
        to read more This is a story about Little Red Ridinghood. One day she
        went into the wood to visit her grandmother. The day after too, She
        visited her every day, every week, every month, every year. She never
        saw a wolf, no even a little fox.
      </BodyLong>
      {/*       
      <h2>small without icon:</h2>      
      <BodyLong size="small">This is a story about Little Red Ridinghood. One day she went into the wood to visit her grandmother. The day after too, She visited her every day, every week, every month, every year. She never saw a wolf, no even a little fox. Go to  <Link href="#" inline >Statistikkbanken</Link> to read more</BodyLong> */}

      <h1>Standalone link in BodyLong</h1>

      <h2>medium without icon:</h2>
      <BodyLong>
        <Link href="#">Statistikkbanken</Link>
      </BodyLong>

      <h2>medium icon left:</h2>
      <BodyLong>
        <Link href="#" icon="FileText" iconPosition="left">
          Statistikkbanken
        </Link>
      </BodyLong>

      <h2>medium icon right:</h2>
      <BodyLong>
        <Link href="#" icon="FileText" iconPosition="right">
          Statistikkbanken
        </Link>
      </BodyLong>

      <h2>small without icon:</h2>
      <BodyLong size="small">
        <Link href="#">Statistikkbanken</Link>
      </BodyLong>

      <h2>small icon left:</h2>
      <BodyLong size="small">
        <Link href="#" icon="FileText" iconPosition="left">
          Statistikkbanken{' '}
        </Link>
      </BodyLong>

      <h2>small icon right:</h2>
      <BodyLong size="small">
        <Link href="#" icon="FileText" iconPosition="right">
          Statistikkbanken
        </Link>
      </BodyLong>

      <h2>Short text less then 44px:</h2>
      <Link href="#" noUnderline>
        x
      </Link>
      <br />
    </>
  );
};

/* import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest'; */
