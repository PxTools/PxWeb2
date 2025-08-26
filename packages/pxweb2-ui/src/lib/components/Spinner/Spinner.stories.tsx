import type { Meta, StoryFn } from '@storybook/react-vite';
import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  component: Spinner,
  title: 'Components/Spinner',
};
export default meta;

export const Options = {
  args: {
    size: 'medium',
  },

  argTypes: {
    size: {
      options: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      control: { type: 'radio' },
    },
  },
};

export const Size: StoryFn<typeof Spinner> = () => {
  return (
    <>
      <div>
        xsmall
        <Spinner size="xsmall"></Spinner>
      </div>
      <div>
        small
        <Spinner size="small"></Spinner>
      </div>
      <div>
        medium
        <Spinner size="medium"></Spinner>
      </div>
      <div>
        large
        <Spinner size="large"></Spinner>
      </div>
      <div>
        xlarge
        <Spinner size="xlarge"></Spinner>
      </div>
    </>
  );
};

export const Variants: StoryFn<typeof Spinner> = () => {
  return (
    <>
      <div>
        default
        <Spinner></Spinner>
      </div>
      <div>
        inverted
        <Spinner variant="inverted"></Spinner>
      </div>
    </>
  );
};
export const Label: StoryFn<typeof Spinner> = () => {
  return (
    <>
      <div>
        default
        <Spinner label="Tabellen lastes..."></Spinner>
      </div>
      <div>
        inverted
        <div style={{ backgroundColor: 'red', width: '300px' }}>
          <Spinner variant="inverted" label="Tabellen lastes..."></Spinner>
        </div>
      </div>
    </>
  );
};
