import { Icon, Label } from '@pxweb2/pxweb2-ui';

import { useTranslation } from 'react-i18next';
import classes from './DataItem.module.scss';

type DataItemProps = {
  label: string;
};

const DataItem = ({ label }: DataItemProps) => {
  const { t } = useTranslation();
  return (
    <div className={classes.dataItem}>
      <Icon iconName="MenuElipsisVertical" />
      <Label>{t('dataItem', { defaultValue: label })}</Label>
    </div>
  );
};

export default DataItem;
