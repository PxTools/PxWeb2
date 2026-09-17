import { Icon, Label } from '@pxweb2/pxweb2-ui';

import { useTranslation } from 'react-i18next';
import classes from './DataItem.module.scss';

type DataItemProps = {
  label: string;
  isDragging?: boolean;
};

const DataItem = ({ label, isDragging = false }: DataItemProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${classes.dataItem}${isDragging ? ` ${classes.dataItemDragging}` : ''}`}
    >
      <Icon iconName="DragVertical" />
      <Label>{t('dataItem', { defaultValue: label })}</Label>
    </div>
  );
};

export default DataItem;
