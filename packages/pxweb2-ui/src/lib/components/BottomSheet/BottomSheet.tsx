import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './BottomSheet.module.scss';
import Heading from '../Typography/Heading/Heading';
import Button from '../Button/Button';

export interface BottomSheetProps {
  readonly heading: string;
  readonly closeLabel?: string;
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function BottomSheet({
  heading,
  closeLabel = 'Close',
  isOpen,
  onClose,
  className = '',
  children,
}: BottomSheetProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(isOpen);
  const bottomSheetRef = useRef<HTMLDialogElement | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsBottomSheetOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const modalElement = bottomSheetRef.current;
    if (!modalElement) {
      return;
    }

    if (isBottomSheetOpen) {
      modalElement.showModal();
    } else {
      modalElement.close();
    }
  }, [isBottomSheetOpen]);

  const handleCloseBottomSheet = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
      setIsBottomSheetOpen(false); // Ensure that the modal's state is updated when it's closed
      setIsClosing(false);
    }, 280); // Match the duration of the slideeOut animation
  };
  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // If the click is on the backdrop and not dragging, close the bottomsheet
    if (bottomSheetRef.current?.isEqualNode(event.target as Node)) {
      handleCloseBottomSheet();
    }
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLDialogElement>,
  ) => {
    if (event.key === 'Escape') {
      handleCloseBottomSheet();
    }
  };

  return (
    <dialog
      onClick={(event) => handleClick(event)}
      onKeyDown={handleKeyDown}
      ref={bottomSheetRef}
      className={
        cl(
          classes.bottomSheet,
          isClosing ? classes.slideout : classes.slidein,
        ) + cssClasses
      }
    >
      <aside className={cl(classes.aside)}>
        <div className={cl(classes.header)}>
          <div className={cl(classes.titleAndxMarkWrapper)}>
            <div className={cl(classes.titleWrapper)}>
              <Heading level="2" size="medium" textcolor="default">
                {heading}
              </Heading>
            </div>
            <Button
              variant="tertiary"
              size="medium"
              icon="XMark"
              aria-label={closeLabel}
              onClick={() => handleCloseBottomSheet()}
            ></Button>
          </div>
        </div>
        <div className={cl(classes.content)}>{children}</div>
      </aside>
    </dialog>
  );
}

export default BottomSheet;
