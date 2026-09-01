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
  focusTrap?: boolean;
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
  focusTrap = false,
  onClose,
  className = '',
  children,
}: Readonly<ModalProps>) {
  const { t } = useTranslation();
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const [isModalOpen, setIsModalOpen] = useState(isOpen);
  const modalRef = useRef<HTMLDialogElement | null>(null);
  const modalButtonKeyDownRef = useRef(false);
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
      } else {
        modalElement.close();
      }
    }
  }, [isModalOpen]);

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
          onClose(updated, keyPress);
          setIsModalOpen(false);
        }
      };

      const handleMouseEvent = (updated: boolean) => {
        if (onClose) {
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

  const handleModalButtonKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      modalButtonKeyDownRef.current = true;
    }
  };

  const handleModalButtonKeyUp = (
    updated: boolean,
    event: ReactKeyboardEvent,
  ) => {
    if (!modalButtonKeyDownRef.current) {
      return;
    }

    modalButtonKeyDownRef.current = false;
    handleCloseModal(updated, event);
  };

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

  useEffect(() => {
    if (!focusTrap || !isModalOpen) {
      return;
    }

    const modalElement = modalRef.current;
    if (!modalElement) {
      return;
    }

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') {
        return;
      }

      const focusableElements = Array.from(
        modalElement.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements.at(-1);
       if (!firstElement || !lastElement) {
        return;
      }
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    modalElement.addEventListener('keydown', handleTabKey);
    return () => modalElement.removeEventListener('keydown', handleTabKey);
  }, [focusTrap, isModalOpen]);

  return (
    <dialog
      data-px-overlay-backdrop="true"
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
              onKeyDown={handleModalButtonKeyDown}
              onKeyUp={(event) => handleModalButtonKeyUp(false, event)}
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
            onKeyDown={handleModalButtonKeyDown}
            onKeyUp={(event) => handleModalButtonKeyUp(true, event)}
            aria-label={confirmLabelValue}
          >
            {confirmLabelValue}
          </Button>
          <Button
            variant="secondary"
            size="medium"
            type="button"
            onClick={() => handleCloseModal(false)}
            onKeyDown={handleModalButtonKeyDown}
            onKeyUp={(event) => handleModalButtonKeyUp(false, event)}
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
