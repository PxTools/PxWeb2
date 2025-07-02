import { useTranslation } from 'react-i18next';

import { Button, ContentBox } from '@pxweb2/pxweb2-ui';
import useTableData from '../../../context/useTableData';

function PivotButton() {
  const { t } = useTranslation();
  const pivotTableClockwise = useTableData().pivotCW;

  return (
    <Button
      variant="primary"
      onClick={() => pivotTableClockwise()}
      icon="ArrowCirclepathClockwise"
    >
      {t('presentation_page.sidemenu.edit.customize.pivot.title')}
    </Button>
  );
}

export function DrawerEdit() {
  return (
    <ContentBox>
      <PivotButton />
    </ContentBox>
  );
}

DrawerEdit.displayName = 'DrawerEdit';
