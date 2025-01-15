import cl from 'clsx';

import classes from './SideSheet.module.scss';

export interface SideSheetProps {
  readonly isOpen: boolean;
  readonly className?: string;
  readonly children: React.ReactNode;
}

export function SideSheet({
  isOpen,
  className = '',
  children,
}: SideSheetProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <div className={cl(classes.sideSheet) + cssClasses}>
      <span>SideSheet</span>
      <div>{children}</div>
      {isOpen && <span>SideSheet is open</span>}
    </div>
  );
}

export default SideSheet;
