import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './Modal.module.scss';

export interface ModalProps {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export function Modal({
  isOpen, hasCloseBtn, onClose, children
}: ModalProps) {
  const [isModalOpen, setModalOpen] = useState(isOpen);
  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    setModalOpen(isOpen);
  }, [isOpen]);
  
  useEffect(() => {
    const modalElement = modalRef.current;
    if (modalElement) {
      if (isModalOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
  }, [isModalOpen]);

  const handleCloseModal = () => {
    if (onClose) {
      onClose();
    }
    setModalOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal();
    }
  };

  return (
  <dialog ref={modalRef} onKeyDown={handleKeyDown}>
    {hasCloseBtn && (
      <button className="modal-close-btn" onClick={handleCloseModal}>
        Close
      </button>
    )}
    {children}
  </dialog>
  );
}

export default Modal;
