import { FC, Fragment } from 'react';
import deburr from 'lodash/deburr';

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
        const isHighlighted =
          deburr(part).toLowerCase() ===
          deburr(searchTerm).replaceAll('\\', '').toLowerCase();

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
