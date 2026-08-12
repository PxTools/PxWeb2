import { Label } from '@pxweb2/pxweb2-ui';

import styles from './EmtyList.module.scss';

type EmtyListProps = {
  label?: string;
  hideLabel?: boolean;
};

const EmtyList = ({ label = '', hideLabel = false }: EmtyListProps) => {
  return (
    <div className={styles.emptyListBox}>
      {!hideLabel && label ? <Label>{label}</Label> : null}
    </div>
  );
};

export default EmtyList;
