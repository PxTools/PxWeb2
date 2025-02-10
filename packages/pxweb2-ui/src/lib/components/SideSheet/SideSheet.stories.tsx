import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import { SideSheet, SideSheetProps } from './SideSheet';

const meta: Meta<typeof SideSheet> = {
  component: SideSheet,
  title: 'Components/SideSheet',
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

  render: (args: SideSheetProps) => (
    <SideSheet {...args}>{content && <div>{content}</div>}</SideSheet>
  ),

  return: SideSheet,
};

export const Open: StoryFn<typeof SideSheet> = () => {
  const [isSideSheetOpen, setIsSideSheetOpen] = useState<boolean>(false);
  return (
    <>
      <button onClick={() => setIsSideSheetOpen(true)}>Open SideSheet</button>
      {isSideSheetOpen && (
        <SideSheet
          heading="Information"
          isOpen={true}
          onClose={() => {
            setIsSideSheetOpen(false);
          }}
        >
          <div>Any content</div>
        </SideSheet>
      )}
    </>
  );
};
