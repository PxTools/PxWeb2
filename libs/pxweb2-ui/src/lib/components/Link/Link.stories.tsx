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
    children: 'En godt skrevet lenketekst'
  },
};


export const inlineAndStandalone: StoryFn<typeof BodyLong> = () => {
  return (
    <>
      <h1>Inline link in BodyLong</h1>

      <h2>medium without icon:</h2>      
      <BodyLong>Gå til <Link href="#" inline >Statistikkbanken</Link> dersom du vil se flere tabeller </BodyLong>


      <h2>medium icon left:</h2>      
      <BodyLong>Gå til <Link href="#" inline icon="FileText" iconPosition="left">Statistikkbanken</Link> dersom du vil se flere tabeller </BodyLong>


      <h2>medium icon right:</h2>      
      <BodyLong>Gå til <Link href="#" inline icon="FileText" iconPosition="right">Statistikkbanken</Link> dersom du vil se flere tabeller </BodyLong>

      
      <h1>Standalone link in BodyLong</h1>

      <h2>medium without icon:</h2>      
      <BodyLong><Link href="#">Statistikkbanken</Link></BodyLong>

      
      <h2>small without icon:</h2>   
      <BodyLong size='small'><Link href="#">Statistikkbanken</Link></BodyLong>

      <h2>small icon left:</h2>
      <BodyLong size='small'><Link href="#" icon="FileText" iconPosition="left">Statistikkbanken </Link></BodyLong>
      
      <h2>medium icon left:</h2>      
      <BodyLong><Link href="#" icon="FileText" iconPosition="left">Statistikkbanken</Link></BodyLong>

      <h2>medium icon right:</h2>      
      <BodyLong><Link href="#" icon="FileText" iconPosition="right">Statistikkbanken</Link></BodyLong>

      <h2>small icon right:</h2>
      <BodyLong size='small'><Link href="#" icon="FileText" iconPosition="right">Statistikkbanken</Link></BodyLong>

      <h2>Short text less then 24px:</h2>
     <Link href="#" noUnderline>x</Link><br />
    </>
  );
};

/* import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest'; */
