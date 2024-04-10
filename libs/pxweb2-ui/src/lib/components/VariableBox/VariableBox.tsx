import styles from './VariableBox.module.scss';

/* eslint-disable-next-line */
export interface VariableBoxProps {}

export function VariableBox(props: VariableBoxProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to VariableBox!</h1>
    </div>
  );
}

export default VariableBox;
