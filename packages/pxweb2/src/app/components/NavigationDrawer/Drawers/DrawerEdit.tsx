import { useTranslation } from 'react-i18next';

import { ActionItem, ContentBox, Variable } from '@pxweb2/pxweb2-ui';
import useTableData from '../../../context/useTableData';

interface PivotButtonProps {
  readonly stub: Variable[];
  readonly heading: Variable[];
}

function PivotButton({ stub, heading }: PivotButtonProps) {
  const { t } = useTranslation();
  const pivotTableClockwise = useTableData().pivotCW;
  const buildTableTitle = useTableData().buildTableTitle;
  const { firstTitlePart, lastTitlePart } = buildTableTitle(stub, heading);
  const dynamicAriaLabel = t(
    'presentation_page.sidemenu.edit.customize.pivot.aria-label',
    {
      first_variables: firstTitlePart,
      last_variable: lastTitlePart,
    },
  );

  /*
    TODO:
    Fix Screen reader label
      - Are there any tables with only 1 variable? technically could happen
  */

  return (
    <ActionItem
      label={t('presentation_page.sidemenu.edit.customize.pivot.title')}
      ariaLabel={dynamicAriaLabel}
      aria-live="polite"
      aria-atomic="true"
      aria-relevant="text"
      onClick={() => pivotTableClockwise()}
      iconName="ArrowCirclepathClockwise"
    />
  );
}

export function DrawerEdit() {
  const data = useTableData().data;
  const { t } = useTranslation();

  return (
    <ContentBox title={t('presentation_page.sidemenu.edit.customize.title')}>
      {data && <PivotButton stub={data.stub} heading={data.heading} />}
    </ContentBox>
  );
}

DrawerEdit.displayName = 'DrawerEdit';
