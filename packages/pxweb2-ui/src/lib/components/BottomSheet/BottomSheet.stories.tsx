import type { Meta, StoryFn } from '@storybook/react';

import { BottomSheet, BottomSheetProps } from './BottomSheet';

const meta: Meta<typeof BottomSheet> = {
  component: BottomSheet,
  title: 'Components/BottomSheet',
};
export default meta;

const content = 'Any content...';

export const Default = {
  args: {
    heading: 'Information',
    isOpen: true,
    onClose: () => {
      console.log('Modal closed');
    },
    children: <div>{content}</div>,
  },

  render: (args: BottomSheetProps) => (
    <BottomSheet {...args}>{content && <div>{content}</div>}</BottomSheet>
  ),

  return: BottomSheet,
};

export const MobileView: StoryFn<typeof BottomSheet> = () => {
  return (
    <BottomSheet
      heading="Information"
      isOpen={true} // Open by default
      onClose={() => {
        console.log('BottomSheet closed');
      }}
    >
      <div>
        Any content for for this bottomsheet will make the padding show..
      </div>
    </BottomSheet>
  );
};

MobileView.parameters = {
  viewport: {
    viewports: {
      mobile1: {
        name: 'Mobile 1',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      mobile2: {
        name: 'Mobile 2',
        styles: {
          width: '414px',
          height: '736px',
        },
      },
    },
    defaultViewport: 'mobile1',
  },
};
