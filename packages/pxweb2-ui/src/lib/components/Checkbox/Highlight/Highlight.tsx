import { FC, Fragment } from 'react';

import styles from './Highlight.module.scss';

interface HighlightProps {
  text: string;
  searchTerm?: string;
}
export const Highlight: FC<HighlightProps> = ({ text, searchTerm }) => {
  if (!searchTerm || searchTerm.length < 1) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} className={styles.highlight}>
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </span>
  );
};
