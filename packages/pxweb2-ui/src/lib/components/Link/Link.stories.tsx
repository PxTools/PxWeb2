import type { Meta, StoryObj, StoryFn } from '@storybook/react-vite';

import { Link } from './Link';
import { BodyLong } from '../Typography/BodyLong/BodyLong';

const meta: Meta<typeof Link> = {
  component: Link,
  title: 'Components/Link',
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Variants: Story = {
  args: {
    href: '#',
    children: 'En godt skrevet lenketekst',
    size: 'medium',
  },
};

export const InlineAndStandalone: StoryFn<typeof BodyLong> = () => {
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

      <h2>medium icon end:</h2>
      <BodyLong>
        This is a story about Little Red Ridinghood. One day she went into the
        wood to visit her grandmother. The day after too, She visited her every
        day, every week, every month, every year. She never saw a wolf, no even
        a little fox. Go to{' '}
        <Link href="#" inline icon="FileText" iconPosition="end">
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

      <h1>Standalone link </h1>

      <h2>medium without icon:</h2>
      <Link href="#" size="medium">
        Statistikkbanken
      </Link>

      <h2>medium icon start:</h2>
      <Link href="#" icon="FileText" iconPosition="start" size="medium">
        Statistikkbanken
      </Link>

      <h2>medium icon end:</h2>
      <Link href="#" icon="FileText" iconPosition="end" size="medium">
        Statistikkbanken
      </Link>

      <h2>small without icon:</h2>
      <Link href="#" size="small">
        Statistikkbanken
      </Link>

      <h2>small icon start:</h2>
      <Link href="#" icon="FileText" iconPosition="start" size="small">
        Statistikkbanken{' '}
      </Link>

      <h2>small icon end:</h2>
      <Link href="#" icon="FileText" iconPosition="end" size="small">
        Statistikkbanken
      </Link>
      <br />
    </>
  );
};
