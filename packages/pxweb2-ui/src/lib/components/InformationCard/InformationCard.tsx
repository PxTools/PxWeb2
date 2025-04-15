import cl from 'clsx';
import React from 'react';
import styles from './InformationCard.module.scss';

import { Heading, Icon, IconProps } from '@pxweb2/pxweb2-ui';

export interface InformationCardProps {
  icon: IconProps['iconName'];
  headingText?: string;
  headingLevel?: '1' | '2' | '3' | '4' | '5' | '6';
  children: React.ReactNode;
}

export function InformationCard({
  icon,
  headingText,
  headingLevel = '3',
  children,
}: InformationCardProps) {
  return (
    <div className={cl(styles['information-card'])}>
      <Icon iconName={icon} className={styles['icon-wrapper']} />
      <div className={styles['content-wrapper']}>
        {headingText && (
          <Heading size="medium" level={headingLevel} className={cl(styles['heading-wrapper'])}>
            {headingText}
          </Heading>
        )}
        <div className={styles['child-wrapper']}>{children}</div>
      </div>
    </div>
  );
}
