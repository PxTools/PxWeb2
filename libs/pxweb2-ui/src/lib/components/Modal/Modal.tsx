import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './Modal.module.scss';

export interface ModalProps {
  isOpen: boolean;
  hasCloseBtn?: boolean;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen, 
  hasCloseBtn, 
  onClose, 
  className = '', 
  children
}: ModalProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
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
  <dialog ref={modalRef} onKeyDown={handleKeyDown} className={cl(classes.modal) + cssClasses}>
    <div className={cl(classes.header)}>
    </div>
    <div className={cl(classes.body)}>
      {children}
    </div>
    <div className={cl(classes.footer)}>
      {hasCloseBtn && (
        <button className="modal-close-btn" onClick={handleCloseModal}>
          Close
        </button>
      )}
    </div>
  </dialog>
  );
}

export default Modal;
