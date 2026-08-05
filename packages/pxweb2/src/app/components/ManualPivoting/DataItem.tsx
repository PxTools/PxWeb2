import { Label } from '@pxweb2/pxweb2-ui';

import { useTranslation } from 'react-i18next';

const DataItem = () => {
  const { t } = useTranslation();
  return <Label>{t('dataItem', { defaultValue: 'Data item test' })}</Label>;
};

export default DataItem;
