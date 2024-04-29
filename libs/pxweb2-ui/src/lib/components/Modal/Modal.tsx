import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './Modal.module.scss';
import Label from '../Typography/Label/Label';
import Heading from '../Typography/Heading/Heading';
import Button from '../Button/Button';

export interface ModalProps {
  label?: string;
  secondLabel?: string;
  isOpen: boolean;
  onClose?: (updated: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Modal({
  label,
  secondLabel,
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

  const handleCloseModal = (updated: boolean) => {
    if (onClose) {
      onClose(updated);
    }
    setModalOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Escape") {
      handleCloseModal(false);
    }
  };

  return (
  <dialog ref={modalRef} onKeyDown={handleKeyDown} className={cl(classes.modal) + cssClasses}>
    <div className={cl(classes.header)}>
      <div className={cl(classes.headercontent)}>
        <div className={cl(classes.headings)}>
          {label && (<Label size="medium" textcolor="default">{label}</Label>)}
          {secondLabel && (<Heading size="medium" textcolor="default">{secondLabel}</Heading>)}
        </div>
        <div className={cl(classes.xmarkwrapper)}>
          <Button variant="tertiary" size="small" icon="XMark" onClick={() => handleCloseModal(false)}></Button>
        </div>
      </div>
    </div>
    <div className={cl(classes.body)}>
      {children}
    </div>
    <div className={cl(classes.footer)}>
      <div className={cl(classes.buttongroup)}>
        <Button variant="secondary" size="medium" onClick={() => handleCloseModal(false)}>Cancel</Button>
        <Button variant="primary" size="medium" onClick={() => handleCloseModal(true)}>Save</Button>
      </div>
    </div>
  </dialog>
  );
}

export default Modal;
