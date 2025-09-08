import React from 'react';

import { useTopicIcons } from '../../util/hooks/useTopicIcons';
import { Heading, Label } from '@pxweb2/pxweb2-ui';
import styles from './TopicIcons.module.scss';

export const TopicIcons: React.FC = () => {
  const icons = useTopicIcons();

  return (
    <div className={styles.topicIcons}>
      <Heading level="1" size="large">
        Topic icons
      </Heading>
      <div className={styles.iconList}>
        {icons.map(({ id, fileName, medium }) => (
          <div key={id} className={styles.iconItem}>
            <div className={styles.iconWrapper}>{medium}</div>
            <Label className={styles.iconLabel}>{fileName}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicIcons;
