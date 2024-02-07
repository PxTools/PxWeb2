import React from 'react';
import styles from './Ingress.module.scss';

interface IngressProps {
  children: React.ReactNode;  
}

export const Ingress: React.FC<IngressProps> = ({ children }) => {
  return (
    <p className={styles.ingress}>
      {children}
    </p>
  );
};

export default Ingress;
