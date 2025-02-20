import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
} from 'react';

import classes from './Modal.module.scss';
import Label from '../Typography/Label/Label';
import Heading from '../Typography/Heading/Heading';
import Button from '../Button/Button';

export interface ModalProps {
  label?: string;
  heading?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  isOpen: boolean;
  onClose?: (updated: boolean, keyPress?: ' ' | 'Enter' | 'Escape') => void;
  className?: string;
  children: React.ReactNode;
}

export function Modal({
  label,
  heading,
  cancelLabel = '',
  confirmLabel = '',
  isOpen,
  onClose,
  className = '',
  children,
}: Readonly<ModalProps>) {
  const { t } = useTranslation();
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  let cancelLabelValue = cancelLabel;
  let confirmLabelValue = confirmLabel;

  if (cancelLabelValue === '') {
    cancelLabelValue = t('common.generic_buttons.cancel');
  }
  if (confirmLabelValue === '') {
    confirmLabelValue = t('common.generic_buttons.save');
  }

  useEffect(() => {
    setIsModalOpen(isOpen);
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

  const handleCloseModal = useCallback(
    (updated: boolean, event?: ReactKeyboardEvent | MouseEvent) => {
      const handleKeyboardEvent = (
        updated: boolean,
        event: ReactKeyboardEvent,
      ) => {
        const keyPress = event.key;
        const isValidKeyPress =
          keyPress === 'Enter' || keyPress === ' ' || keyPress === 'Escape';

        if (onClose && isValidKeyPress) {
          setWindowScroll(true);
          onClose(updated, keyPress);
          setIsModalOpen(false);
        }
      };

      const handleMouseEvent = (updated: boolean) => {
        if (onClose) {
          setWindowScroll(true);
          onClose(updated);
          setIsModalOpen(false);
        }
      };
      if (event) {
        handleKeyboardEvent(updated, event as ReactKeyboardEvent);
      } else {
        handleMouseEvent(updated);
      }
    },
    [onClose],
  );

  useEffect(() => {
    // Handle the Escape key to close the modal
    const handleKeyDownInModal = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // 'as unknown as ReactKeyboardEvent' is a hack to avoid the type error when passing the event to the function
        handleCloseModal(false, event as unknown as ReactKeyboardEvent);
      }
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default behavior of the Enter key on buttons (turns it into a mouse click event)
      }
    };

    document.addEventListener('keydown', handleKeyDownInModal);
    return () => document.removeEventListener('keydown', handleKeyDownInModal);
  }, [handleCloseModal]);

  return (
    <dialog
      ref={modalRef}
      className={cl(classes.modal) + cssClasses}
      aria-labelledby="px-modal-heading"
    >
      <div className={cl(classes.header)}>
        <div className={cl(classes.headerContent)}>
          <Heading
            id="px-modal-heading"
            level="3"
            className={cl(classes.headings)}
          >
            {label && (
              <Label size="medium" textcolor="default">
                {label}
              </Label>
            )}
            {heading && <span>{heading}</span>}
          </Heading>
          <div className={cl(classes.xMarkWrapper)}>
            <Button
              variant="tertiary"
              size="small"
              icon="XMark"
              type="button"
              onClick={() => handleCloseModal(false)}
              onKeyUp={(event) => handleCloseModal(false, event)}
              aria-label={cancelLabelValue}
            ></Button>
          </div>
        </div>
      </div>
      {/* tabIndex to fix the div being focusable for some reason */}
      <div className={cl(classes.body)} tabIndex={-1}>
        {children}
      </div>
      <div className={cl(classes.footer)}>
        <div className={cl(classes.buttonGroup)}>
          <Button
            variant="primary"
            size="medium"
            type="button"
            onClick={() => handleCloseModal(true)}
            onKeyUp={(event) => handleCloseModal(true, event)}
            aria-label={confirmLabelValue}
          >
            {confirmLabelValue}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            type="button"
            onClick={() => handleCloseModal(false)}
            onKeyUp={(event) => handleCloseModal(false, event)}
            aria-label={cancelLabelValue}
          >
            {cancelLabelValue}
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export default Modal;
