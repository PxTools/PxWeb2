import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import { Modal, ModalProps } from './Modal';

const meta: Meta<typeof Modal> = {
  component: Modal,
  title: 'Components/Modal',
};
export default meta;

const content = 'Hej';

export const Default = {
  args: {
    hasCloseBtn: true,
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
      <Modal hasCloseBtn={true} isOpen={isModalOpen} onClose={() => {
                setModalOpen(false);
              }}>
        <div>Hej</div>
      </Modal>
    </>
  );
};