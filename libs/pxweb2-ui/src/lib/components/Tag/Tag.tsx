import cl from 'clsx';
import classes from './Tag.module.scss';

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'medium' | 'small' | 'xsmall';
  variant?: 'neutral' | 'info' | 'success'| 'warning'| 'error';
  type?: 'default' | 'border';
  children?: React.ReactNode;
}

export function Tag({
  size = 'medium',
  variant = 'neutral',
  type = 'default',
  children,
  ...rest
}: TagProps) {
  return (
    <span 
    className={cl(
      classes.tag,
      classes[size],
      classes[variant],
      classes[type] 
      )}      
      >
      {children}
    </span>
  );
}

export default Tag;
