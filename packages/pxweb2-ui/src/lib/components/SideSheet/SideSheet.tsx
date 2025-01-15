import cl from 'clsx';

import classes from './SideSheet.module.scss';
import Button from '../Button/Button';

export interface SideSheetProps {
  readonly isOpen: boolean;
  readonly onClose?: () => void;
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function SideSheet({
  isOpen,
  onClose,
  className = '',
  children,
}: SideSheetProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  const handleCloseSideSheet = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={cl(classes.sideSheet) + cssClasses}>
      <span>SideSheet</span>
      <Button
        variant="tertiary"
        size="small"
        icon="XMark"
        onClick={() => handleCloseSideSheet()}
      ></Button>
      <div>{children}</div>
      {isOpen && <span>SideSheet is open</span>}
    </div>
  );
}

export default SideSheet;
