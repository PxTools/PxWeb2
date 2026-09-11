import { Label } from '@pxweb2/pxweb2-ui';

import styles from './EmtyList.module.scss';

type EmtyListProps = {
  label?: string;
  hideLabel?: boolean;
  active?: boolean;
};

const EmtyList = ({
  label = '',
  hideLabel = false,
  active = false,
}: EmtyListProps) => {
  return (
    <div
      className={`${styles.emptyListBox} ${active ? styles.active : ''}`}
      data-active={active || undefined}
    >
      {!hideLabel && label ? <Label>{label}</Label> : null}
    </div>
  );
};

export default EmtyList;
