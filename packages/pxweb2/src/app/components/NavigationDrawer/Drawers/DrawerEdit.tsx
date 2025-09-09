import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionItem, ContentBox, Variable, Alert } from '@pxweb2/pxweb2-ui';
import useTableData from '../../../context/useTableData';
import classes from './DrawerEdit.module.scss';

interface PivotButtonProps {
  readonly stub: Variable[];
  readonly heading: Variable[];
}

function PivotButton({ stub, heading }: PivotButtonProps) {
  const { t } = useTranslation();
  const pivotTableClockwise = useTableData().pivotCW;
  const buildTableTitle = useTableData().buildTableTitle;

  // Live region text for screen readers after activation
  const [statusMessage, setStatusMessage] = useState('');
  const [announceOnNextChange, setAnnounceOnNextChange] = useState(false);

  const handleClick = () => {
    setAnnounceOnNextChange(true);
    pivotTableClockwise();
  };

  // When stub/heading update after pivot, compute and announce the new screen reader message
  useEffect(() => {
    if (!announceOnNextChange) {
      return;
    }

    const { firstTitlePart, lastTitlePart } = buildTableTitle(stub, heading);
    const message = t(
      'presentation_page.sidemenu.edit.customize.pivot.screen_reader_announcement',
      {
        first_variables: firstTitlePart,
        last_variable: lastTitlePart,
      },
    );

    // Clear first to ensure assistive tech re-announces even if message repeats
    setStatusMessage('');
    const timer = setTimeout(() => setStatusMessage(message), 0); // Force state update on different ticks
    setAnnounceOnNextChange(false);

    return () => clearTimeout(timer);
  }, [stub, heading, announceOnNextChange, buildTableTitle, t]);

  return (
    <>
      <ActionItem
        label={t('presentation_page.sidemenu.edit.customize.pivot.title')}
        ariaLabel={t(
          'presentation_page.sidemenu.edit.customize.pivot.aria_label',
        )}
        onClick={handleClick}
        iconName="ArrowCirclepathClockwise"
      />
      <output aria-live="polite" aria-atomic="true" className={classes.srOnly}>
        {statusMessage}
      </output>
    </>
  );
}

export function DrawerEdit() {
  const data = useTableData().data;
  const { t } = useTranslation();

  return (
    <ContentBox title={t('presentation_page.sidemenu.edit.customize.title')}>
      {data && <PivotButton stub={data.stub} heading={data.heading} />}
      <Alert variant="info" className={classes.alert}>
        {t('common.status_messages.drawer_edit')}
      </Alert>
    </ContentBox>
  );
}

DrawerEdit.displayName = 'DrawerEdit';
