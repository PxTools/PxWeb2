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
  children,
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
        modalElement.showModal();
        setWindowScroll(false);
      } else {
        modalElement.close();
        setWindowScroll(true);
      }
     }
  }, [isModalOpen]);

  const setWindowScroll = (scroll: boolean) => {
    const body = document.querySelector('body');
    if (body) {
      body.style.overflow = scroll ? 'auto' : 'hidden';
    }
  };

  const handleCloseModal = (updated: boolean) => {
    setWindowScroll(true);
    if (onClose) {
      onClose(updated);
    }
    setModalOpen(false); // Ensure that the modal's state is updated when it's closed
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLDialogElement>
  ) => {
    if (event.key === 'Escape') {
      handleCloseModal(false);
    }
  };

  return (
    <dialog
      ref={modalRef}
      onKeyDown={handleKeyDown}
      className={cl(classes.modal) + cssClasses}
    >
      <div className={cl(classes.header)}>
        <div className={cl(classes.headerContent)}>
          <div className={cl(classes.headings)}>
            {label && (
              <Label size="medium" textcolor="default">
                {label}
              </Label>
            )}
            {heading && (
              <Heading size="medium" textcolor="default">
                {heading}
              </Heading>
            )}
          </div>
          <div className={cl(classes.xMarkWrapper)}>
            <Button
              variant="tertiary"
              size="small"
              icon="XMark"
              onClick={() => handleCloseModal(false)}
              aria-label={t('common.generic_buttons.cancel')}
            ></Button>
          </div>
        </div>
      </div>
      <div className={cl(classes.body)}>{children}</div>
      <div className={cl(classes.footer)}>
        <div className={cl(classes.buttonGroup)}>
          <Button
            variant="primary"
            size="medium"
            onClick={() => handleCloseModal(true)}
            aria-label={t('common.generic_buttons.save')}
          >
            {t('common.generic_buttons.save')}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            onClick={() => handleCloseModal(false)}
            aria-label={t('common.generic_buttons.cancel')}
          >
            {t('common.generic_buttons.cancel')}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export default Modal;
