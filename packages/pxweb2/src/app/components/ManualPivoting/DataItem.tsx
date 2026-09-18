import { Icon, Label } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';
import classes from './DataItem.module.scss';

type DataItemProps = {
  label: string;
  isDragging?: boolean;
  isKeyboardDragging?: boolean;
};

const DataItem = ({
  label,
  isDragging = false,
  isKeyboardDragging = false,
}: DataItemProps) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${classes.dataItem}${isDragging ? ` ${classes.dataItemDragging}` : ''}${isKeyboardDragging ? ` ${classes.dataItemKeyboardDragging}` : ''}`}
    >
      <Icon iconName="DragVertical" />
      <Label>{t('dataItem', { defaultValue: label })}</Label>
    </div>
  );
};

export default DataItem;
