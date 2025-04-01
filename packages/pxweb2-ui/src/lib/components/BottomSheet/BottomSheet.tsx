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
  const startYRef = useRef<number | null>(null);
  const startHeightRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const defaultPos = window.innerHeight * 0.7;
  const maxPos = window.innerHeight * 0.9;
  const closingPos = window.innerHeight * 0.15;

  useEffect(() => {
    setIsBottomSheetOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const modalElement = bottomSheetRef.current;
    if (modalElement) {
      if (isBottomSheetOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
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

  const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    startYRef.current = event.clientY;
    startHeightRef.current = bottomSheetRef.current?.clientHeight ?? null;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLButtonElement>) => {
    startYRef.current = event.touches[0].clientY;
    startHeightRef.current = bottomSheetRef.current?.clientHeight ?? null;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (
      startYRef.current !== null &&
      startHeightRef.current !== null &&
      bottomSheetRef.current
    ) {
      const newHeight =
        startHeightRef.current - (event.clientY - startYRef.current);
      if (newHeight >= closingPos && newHeight <= maxPos) {
        bottomSheetRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (
      startYRef.current !== null &&
      startHeightRef.current !== null &&
      bottomSheetRef.current
    ) {
      const newHeight =
        startHeightRef.current - (event.touches[0].clientY - startYRef.current);
      if (newHeight >= closingPos && newHeight <= maxPos) {
        bottomSheetRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    if (bottomSheetRef.current) {
      const currentHeight = bottomSheetRef.current.clientHeight;
      const closestPos = [closingPos, defaultPos, maxPos].reduce(
        (prev, curr) =>
          Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight)
            ? curr
            : prev,
        closingPos,
      );
      if (closestPos === closingPos) {
        handleCloseBottomSheet();
      } else {
        bottomSheetRef.current.style.height = `${closestPos}px`;
      }
    }
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
    if (bottomSheetRef.current) {
      const currentHeight = bottomSheetRef.current.clientHeight;
      const closestPos = [closingPos, defaultPos, maxPos].reduce(
        (prev, curr) =>
          Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight)
            ? curr
            : prev,
        closingPos,
      );
      if (closestPos === closingPos) {
        handleCloseBottomSheet();
      } else {
        bottomSheetRef.current.style.height = `${closestPos}px`;
      }
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
      <button
        draggable={true}
        onDragStart={(e) => e.preventDefault()} // Prevent default drag behavior
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={cl(classes.dragHandleWrapper)}
        aria-label="Drag to resize"
      >
        <div className={cl(classes.dragHandle)}></div>
      </button>

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
