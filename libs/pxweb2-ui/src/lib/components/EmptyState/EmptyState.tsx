import cl from 'clsx';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps {
  headingTxt: string;
  children: React.ReactNode;
}

export function EmptyState({ headingTxt, children }: EmptyStateProps) {
  return (
    <div className={cl(styles['empty-state'])}>
      <div className={cl(styles['empty-state-content'])}>
        {/* <div className={cl(styles['empty-state-illustration'])}>
          // TODO: Add an illustration/svg here
        </div> */}
        <div className={cl(styles['empty-state-text'])}>
          <div
            className={cl(
              styles['empty-state-heading'],
              styles['heading-small']
            )}
          >
            {headingTxt}
          </div>
          <div
            className={cl(
              styles['empty-state-description'],
              styles['bodyshort-medium']
            )}
          >
            <p>{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmptyState;
