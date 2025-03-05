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
      {parts.map((part, index) => {
        // Create a more meaningful and stable key, truncating the part if necessary
        const isHighlighted = part.toLowerCase() === searchTerm.toLowerCase();
        const keyPrefix = isHighlighted ? 'highlight' : 'text';
        const key = `${keyPrefix}-${index}-${part.substring(0, 10)}`;

        return isHighlighted ? (
          <span key={key} className={styles.highlight}>
            {part}
          </span>
        ) : (
          <Fragment key={key}>{part}</Fragment>
        );
      })}
    </span>
  );
};
