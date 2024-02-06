import React from 'react';
import styles from './Ingress.module.scss';

interface IngressProps {
  children: React.ReactNode;  
}

export const Ingress: React.FC<IngressProps> = ({ children }) => {
  return (
    <div className={styles.ingress}>
      {children}
    </div>
  );
};

export default Ingress;
