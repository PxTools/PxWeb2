import cl from 'clsx';
import React from 'react';
import styles from './InformationCard.module.scss';

import { Heading, Icon, IconProps } from '@pxweb2/pxweb2-ui';

export interface InformationCardProps {
  icon: IconProps['iconName'];
  headingText?: string;
  headingSize?: 'small' | 'xsmall' | 'medium' | 'large' | 'xlarge';
  children: React.ReactNode;
}

export function InformationCard({
  icon,
  headingText,
  headingSize = 'small',
  children,
}: InformationCardProps) {
  return (
    <div className={cl(styles['information-card'])}>
      <Icon iconName={icon} className={styles['icon-wrapper']} />
      <div className={styles['content-wrapper']}>
        {headingText && <Heading size={headingSize} className={cl(styles['heading-wrapper'])} >{headingText}</Heading>}
        <div className={styles['child-wrapper']}>{children}</div>
      </div>
    </div>
  );
}
