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
  readonly contentRef?: React.RefObject<HTMLDivElement | null>;
}

export function BottomSheet({
  heading,
  closeLabel = 'Close',
  isOpen,
  onClose,
  className = '',
  children,
  contentRef,
}: BottomSheetProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(isOpen);
  const bottomSheetRef = useRef<HTMLDialogElement | null>(null);
  const startYRef = useRef<number | null>(null);
  const startXRef = useRef<number | null>(null);
  const startHeightRef = useRef<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [dragState, setDragState] = useState({
    isDragging: false,
    isScrolling: false,
    isDragAllowed: false,
  });

  const defaultPos = window.innerHeight * 0.5;
  const maxPos = window.innerHeight * 0.95;
  const closingPos = window.innerHeight * 0.49;
  const minPos = window.innerHeight * 0.1;

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

  const determineDragAllowed = (
    event:
      | React.TouchEvent<HTMLDialogElement>
      | React.MouseEvent<HTMLDialogElement>,
  ): boolean => {
    const contentElement = contentRef?.current;
    const isTouchOutsideContent =
      contentElement && !contentElement.contains(event.target as Node);
    if (
      isTouchOutsideContent ||
      (contentElement && contentElement.scrollTop === 0)
    ) {
      return true; // Allow dragging if the touch is outside the content or if the content is scrolled to the to
    }

    return false;
  };

  const SetPositionRefs = (
    event:
      | React.TouchEvent<HTMLDialogElement>
      | React.MouseEvent<HTMLDialogElement>,
  ) => {
    const clientY =
      'touches' in event ? event.touches[0].clientY : event.clientY;
    const clientX =
      'touches' in event ? event.touches[0].clientX : event.clientX;
    startYRef.current = clientY;
    startXRef.current = clientX;
    startHeightRef.current = bottomSheetRef.current?.clientHeight ?? null;
  };

  const deltaXY = (
    event:
      | React.TouchEvent<HTMLDialogElement>
      | React.MouseEvent<HTMLDialogElement>,
  ): { deltaX: number; deltaY: number } => {
    const clientY =
      'touches' in event ? event.touches[0].clientY : event.clientY;
    const clientX =
      'touches' in event ? event.touches[0].clientX : event.clientX;
    if (startYRef.current === null || startXRef.current === null) {
      return { deltaX: 0, deltaY: 0 };
    }
    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;
    return { deltaX, deltaY };
  };

  const determineDragOrScroll = (deltaXY: {
    deltaX: number;
    deltaY: number;
  }) => {
    if (startYRef.current === null || startXRef.current === null) {
      return;
    }
    const deltaX = deltaXY.deltaX;
    const deltaY = deltaXY.deltaY;
    if (
      !dragState.isDragging &&
      !dragState.isScrolling &&
      dragState.isDragAllowed
    ) {
      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        setDragState((prevState) => ({
          ...prevState,
          isDragging: true,
          isScrolling: false,
        }));
      } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setDragState((prevState) => ({
          ...prevState,
          isScrolling: true,
          isDragging: false,
        }));
      }
    }
  };

  const handleDrag = (
    event: React.TouchEvent<HTMLDialogElement> | MouseEvent,
  ) => {
    if (
      startYRef.current !== null &&
      startHeightRef.current !== null &&
      bottomSheetRef.current
    ) {
      const clientY =
        'touches' in event ? event.touches[0].clientY : event.clientY;
      const newHeight = startHeightRef.current - (clientY - startYRef.current);
      if (newHeight >= minPos && newHeight <= maxPos) {
        bottomSheetRef.current.style.height = `${newHeight}px`;
      }
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDialogElement>) => {
    setDragState((prevState) => ({
      ...prevState,
      isDragging: true,
    }));

    startYRef.current = event.clientY;
    startHeightRef.current = bottomSheetRef.current?.clientHeight ?? null;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDialogElement>) => {
    setDragState({
      isDragging: false,
      isScrolling: false,
      isDragAllowed: determineDragAllowed(event),
    });
    SetPositionRefs(event);
  };

  const handleMouseMove = (event: MouseEvent) => {
    handleDrag(event);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDialogElement>) => {
    if (startYRef.current === null || startXRef.current === null) {
      return;
    }
    const delta = deltaXY(event);
    determineDragOrScroll(delta);

    if (dragState.isDragging) {
      handleDrag(event);
    }
  };

  const handleMouseUp = () => {
    setDragState((prevState) => ({
      ...prevState,
      isDragging: false,
    }));

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
    if (dragState.isDragging) {
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
    }
  };

  return (
    <dialog
      onClick={(event) => handleClick(event)}
      draggable={true}
      onDragStart={(e) => e.preventDefault()} // Prevent default drag behavior
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      ref={bottomSheetRef}
      className={
        cl(
          classes.bottomSheet,
          isClosing ? classes.slideout : classes.slidein,
          dragState.isDragging ? classes.dragging : '',
        ) + cssClasses
      }
    >
      <div className={cl(classes.dragHandleWrapper)}>
        <div className={cl(classes.dragHandle)}></div>
      </div>

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
        <div
          className={cl(
            classes.content,
            dragState.isDragAllowed ? classes.dragAllowed : '',
          )}
        >
          {children}
        </div>
      </aside>
    </dialog>
  );
}

export default BottomSheet;
