import { ReactNode } from 'react';
import cl from 'clsx';

import styles from './ContentBox.module.scss';
import Heading from '../Typography/Heading/Heading';

interface ContentBoxProps {
  readonly title?: string;
  readonly titleDivId?: string;
  readonly children: ReactNode;
}

export function ContentBox({ title, titleDivId, children }: ContentBoxProps) {
  return (
    <div className={cl(styles.contentBox)}>
      {title && (
        <div className={cl(styles.title)}>
          <Heading level={'3'} size={'small'} id={titleDivId}>
            {title}
          </Heading>
        </div>
      )}
      {children}
    </div>
  );
}

ContentBox.displayName = 'ContentBox';
