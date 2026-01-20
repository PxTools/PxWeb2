import cl from 'clsx';
import { useEffect, useRef, useState } from 'react';

import classes from './SideSheet.module.scss';
import Heading from '../Typography/Heading/Heading';
import Button from '../Button/Button';
import { LinkCard } from '../LinkCard/LinkCard';

export interface SideSheetProps {
  readonly heading: string;
  readonly closeLabel?: string;
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly className?: string;
  // readonly children: React.ReactNode;
}

export function SideSheet({
  heading,
  closeLabel = 'Close',
  isOpen,
  onClose,
  className = '',
  // children,
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
              onClick={() => handleCloseSideSheet()}
            ></Button>
          </div>
        </div>
        <div className={cl(classes.content)}>
          {' '}
          <LinkCard
            headingText="Link card"
            description="This is a small link card with heading and description."
            href="#"
            size="small"
          />
        </div>
      </aside>
    </dialog>
  );
}

export default SideSheet;
