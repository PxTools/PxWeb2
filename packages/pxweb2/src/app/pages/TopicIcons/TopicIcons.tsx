import React from 'react';

import { useTopicIcons } from '../../util/hooks/useTopicIcons';
import styles from './TopicIcons.module.scss';

export const TopicIcons: React.FC = () => {
  const icons = useTopicIcons();

  return (
    <div className={styles.topicIcons}>
      <h1>Topic icons</h1>
      <h2>Medium</h2>
      <div className={styles.iconGrid}>
        {icons.map(({ id, fileName, medium }) => (
          <div key={id} className={styles.iconItem}>
            <div className={styles.iconWrapper}>{medium}</div>
            <div className={styles.iconLabel}>{fileName}</div>
          </div>
        ))}
      </div>

      <h2>Small</h2>
      <div className={`${styles.iconGrid} ${styles.small}`}>
        {icons.map(({ id, fileName, small }) => (
          <div key={id} className={styles.iconItem}>
            <div className={`${styles.iconWrapper} ${styles.small}`}>
              {small}
            </div>
            <div className={styles.iconLabel}>{fileName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicIcons;
