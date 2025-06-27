import type { Meta, StoryFn } from '@storybook/react-vite';
import { Skeleton } from './Skeleton';

const meta: Meta<typeof Skeleton> = {
  component: Skeleton,
  title: 'Components/Skeleton',
};
export default meta;

export const Variants: StoryFn<typeof Skeleton> = () => {
  return (
    <>
      <Skeleton height={'50px'} width={'100%'} />
      <Skeleton height={'20px'} width={'200px'} />
      <Skeleton height={'200px'} width={'100%'} />
    </>
  );
};
