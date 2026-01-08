import React, { useEffect, useState } from 'react';

import { Heading, Label } from '@pxweb2/pxweb2-ui';
import styles from './TopicIcons.module.scss';

export const TopicIcons: React.FC = () => {
  const [files, setFiles] = useState<string[] | null>(null);

  useEffect(() => {
    fetch(`/icons/topicIcons.json?v=${__BUILD_DATE__}`)
      .then((res) => res.json())
      .then((data: string[]) => {
        if (!Array.isArray(data)) {
          throw new Error('topicIcons.json must be an array of strings');
        }
        const svgFiles = data.filter(
          (f): f is string => typeof f === 'string' && /\.svg$/i.test(f),
        );
        setFiles(svgFiles);
      })
      .catch((e) => console.error(`Could not load icon list: ${e.message}`));
  }, []);

  if (!files?.length) {
    return (
      <div className={styles.topicIcons}>
        <Heading level="1" size="large">
          Topic icons
        </Heading>
        <p>
          No icons found in <code>public/icons/topicIcons.json</code>.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.topicIcons}>
      <Heading level="1" size="large">
        Topic icons
      </Heading>
      <div className={styles.iconList}>
        {files.map((file) => (
          <div key={file} className={styles.iconItem}>
            <div className={styles.iconWrapper}>
              <img
                src={`/icons/topic/${file}`}
                alt={file.replace(/\.svg$/i, '')}
                loading="lazy"
              />
            </div>
            <Label className={styles.iconLabel}>{file}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicIcons;
