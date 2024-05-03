import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

import classes from './Modal.module.scss';
import Label from '../Typography/Label/Label';
import Heading from '../Typography/Heading/Heading';
import Button from '../Button/Button';

export interface ModalProps {
  label?: string;
  heading?: string;
  isOpen: boolean;
  onClose?: (updated: boolean) => void;
  className?: string;
  children: React.ReactNode;
}

export function Modal({
  label,
  heading,
  isOpen, 
  onClose, 
  className = '', 
  children
}: ModalProps) {
  const { t } = useTranslation();
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
        console.log('showing modal');
        modalElement.showModal();
      } else {
        console.log('closing modal');
        modalElement.close();
      }
    }
  }, [isModalOpen]);

  const delay = async (ms: number | undefined) => {
    return new Promise((resolve) => 
        setTimeout(resolve, ms));
};

  const handleCloseModal = async (updated: boolean) => {
    if (onClose) {
      console.log('closing modal with updated: ', updated);
      const modalElement = modalRef.current;
      if (modalElement) {
        modalElement.setAttribute('closing', '');

        // console.log('waiting for transitionend');

        // // Add an event listener for the 'transitionend' event
        // modalElement.addEventListener('transitionend', (event) => {
        //   console.log('transitionend event:', event.propertyName); // Log the property that finished transitioning
        // });

        // console.log('waiting for transitionend done');

        // // Wait for the 'transitionend' event
        // await new Promise(resolve => modalElement.addEventListener('transitionend', resolve, { once: true }));

        await delay(300);

        // console.log('transitionend done');

        modalElement.removeAttribute('closing');
      }
      console.log('calling onClose');
      onClose(updated);
    }
    console.log('setting modal open to false');
    setModalOpen(false); // Ensure that the modal's state is updated when it's closed
  };

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLDialogElement>) => {
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
          {heading && (<Heading size="medium" textcolor="default">{heading}</Heading>)}
        </div>
        <div className={cl(classes.xmarkwrapper)}>
          <Button variant="tertiary" size="small" icon="XMark" onClick={() => handleCloseModal(false)} aria-label={t('common.generic_buttons.cancel')}></Button>
        </div>
      </div>
    </div>
    <div className={cl(classes.body)}>
      {children}
    </div>
    <div className={cl(classes.footer)}>
      <div className={cl(classes.buttongroup)}>
        <Button variant="secondary" size="medium" onClick={() => handleCloseModal(false)} aria-label={t('common.generic_buttons.cancel')}>{t('common.generic_buttons.cancel')}</Button>
        <Button variant="primary" size="medium" onClick={() => handleCloseModal(true)} aria-label={t('common.generic_buttons.save')}>{t('common.generic_buttons.save')}</Button>
      </div>
    </div>
  </dialog>
  );
}

export default Modal;
