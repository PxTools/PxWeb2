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
  headingSize,
  children,
}: InformationCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <Icon iconName={icon} />
      <div className={styles['with-header']}>
        {headingText && <Heading size={headingSize}>{headingText}</Heading>}
        {children}
      </div>
    </div>
  );
}
