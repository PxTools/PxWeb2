import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './Modal.module.scss';
import Label from '../Typography/Label/Label';
import Heading from '../Typography/Heading/Heading';
import Button from '../Button/Button';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen, 
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
      <div className={cl(classes.headercontent)}>
        <div className={cl(classes.headings)}>
          <Label size="medium" textcolor="default">Select classification</Label>
          <Heading size="medium" textcolor="default">Variable name</Heading>
        </div>
        <div className={cl(classes.xmarkwrapper)}>
          <Button variant="tertiary" size="small" icon="XMark"></Button>
        </div>
      </div>
    </div>
    <div className={cl(classes.body)}>
      {children}
    </div>
    <div className={cl(classes.footer)}>
      <div className={cl(classes.buttongroup)}>
        <Button variant="secondary" size="medium">Cancel</Button>
        <Button variant="primary" size="medium" onClick={handleCloseModal}>Save</Button>
      </div>
    </div>
  </dialog>
  );
}

export default Modal;
