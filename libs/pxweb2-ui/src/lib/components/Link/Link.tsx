import React from 'react';
import styles from './Link.module.scss';

interface LinkProps {
  children: React.ReactNode;
  href: string;
}

export const Link: React.FC<LinkProps> = ({ children, href }) => {
  return (
    <a href={href} className={styles.link}>
      {children}
    </a>
  );
};

export default Link;
