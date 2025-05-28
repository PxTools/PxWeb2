import { ReactNode } from 'react';
import cl from 'clsx';

import styles from './ContentBox.module.scss';

interface ContentBoxProps {
  readonly title?: string;
  readonly children: ReactNode;
}

export function ContentBox({ title, children }: ContentBoxProps) {
  return (
    <div className={cl(styles.contentBox)}>
      {title && (
        <div className={cl(styles.title)}>
          <h3 className={cl(styles.titleText, styles[`label-small`])}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

ContentBox.displayName = 'ContentBox';
