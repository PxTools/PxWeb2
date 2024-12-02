import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Modal, ModalProps } from './Modal';

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: 'Components/Modal',
};
export default meta;

const content = 'Any content...';

export const Default = {
  args: {
    label: 'Label',
    heading: 'Heading',
    isOpen: true,
    onClose: () => {
      console.log('Modal closed');
    },
  },
  
  render: (args: ModalProps) => (
    <Modal {...args}>
      {content && (<div>{content}</div>)}
    </Modal>
  ),
  
  return: Modal,
};


export const Open: StoryFn<typeof Modal> = () => {
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  return (
    <>
      <button onClick={() => setModalOpen(true)}>Open modal</button>
      {isModalOpen && (
      <Modal label="Label" heading="Heading" isOpen={isModalOpen} onClose={() => {
                setModalOpen(false);
              }}>
        <div>Any content</div>
      </Modal>
      )}
    </>
  );
};