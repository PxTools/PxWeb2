import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './SideSheet.module.scss';
import Heading from '../Typography/Heading/Heading';
import Label from '../Typography/Label/Label';
import Button from '../Button/Button';

export interface SideSheetProps {
  readonly heading: string;
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function SideSheet({
  heading,
  isOpen,
  onClose,
  className = '',
  children,
}: SideSheetProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(isOpen);
  const sideSheetRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    setIsSideSheetOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const modalElement = sideSheetRef.current;
    if (modalElement) {
      if (isSideSheetOpen) {
        modalElement.showModal();
      } else {
        modalElement.close();
      }
    }
  }, [isSideSheetOpen]);

  const handleCloseSideSheet = () => {
    if (onClose) {
      onClose();
    }
    setIsSideSheetOpen(false); // Ensure that the modal's state is updated when it's closed
  };

  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    // If the click is on the backdrop, close the side sheet
    if (sideSheetRef.current?.isEqualNode(event.target as Node)) {
      handleCloseSideSheet();
    }
  };

  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLDialogElement>,
  ) => {
    if (event.key === 'Escape') {
      handleCloseSideSheet();
    }
  };

  return (
    <dialog
      onClick={(event) => handleClick(event)}
      onKeyDown={handleKeyDown}
      ref={sideSheetRef}
      className={cl(classes.sideSheet, classes.slidein) + cssClasses}
    >
      <div className={cl(classes.header)}>
        <div className={cl(classes.titleAndxMarkWrapper)}>
          <Heading level="2">
            <Label size="medium" textcolor="default">
              {heading}
            </Label>
          </Heading>
          <div className={cl(classes.xMarkWrapper)}>
            <Button
              variant="tertiary"
              size="small"
              icon="XMark"
              onClick={() => handleCloseSideSheet()}
            ></Button>
          </div>
        </div>
        {/* <div className={cl(classes.tabs)}></div> */}
      </div>
      <div className={cl(classes.content)}>{children}</div>
    </dialog>
  );
}

export default SideSheet;
