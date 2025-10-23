import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionItem, ContentBox, Variable, Alert } from '@pxweb2/pxweb2-ui';
import useTableData from '../../../context/useTableData';
import classes from './DrawerEdit.module.scss';
import { PivotType } from './PivotType';
import useApp from '../../../context/useApp';

interface PivotButtonProps {
  readonly stub: Variable[];
  readonly heading: Variable[];
  readonly pivotType: PivotType;
}

function PivotButton({ stub, heading, pivotType }: PivotButtonProps) {
  const { t } = useTranslation();
  const tableData = useTableData();
  const { pivotCW, pivotAuto, buildTableTitle } = tableData;

  // Live region text for screen readers after activation
  const [statusMessage, setStatusMessage] = useState('');
  const [announceOnNextChange, setAnnounceOnNextChange] = useState(false);

  const handleClick = () => {
    setAnnounceOnNextChange(true);
    if (pivotType === PivotType.Auto) {
      pivotAuto();
    } else {
      pivotCW();
    }
  };

  const screenReaderAnnouncementKey =
    pivotType === PivotType.Auto
      ? 'presentation_page.side_menu.edit.customize.auto_pivot.screen_reader_announcement'
      : 'presentation_page.side_menu.edit.customize.pivot.screen_reader_announcement';

  // When stub/heading update after pivot, compute and announce the new screen reader message
  useEffect(() => {
    if (!announceOnNextChange) {
      return;
    }

    const { firstTitlePart, lastTitlePart } = buildTableTitle(stub, heading);
    const message = t(screenReaderAnnouncementKey, '', {
      first_variables: firstTitlePart,
      last_variable: lastTitlePart,
    });

    // Clear first to ensure assistive tech re-announces even if message repeats
    setStatusMessage('');
    const timer = setTimeout(() => setStatusMessage(message), 0); // Force state update on different ticks
    setAnnounceOnNextChange(false);

    return () => clearTimeout(timer);
  }, [
    stub,
    heading,
    announceOnNextChange,
    buildTableTitle,
    t,
    screenReaderAnnouncementKey,
  ]);

  const labelKey =
    pivotType === PivotType.Auto
      ? 'presentation_page.side_menu.edit.customize.auto_pivot.title'
      : 'presentation_page.side_menu.edit.customize.pivot.title';
  const ariaLabelKey =
    pivotType === PivotType.Auto
      ? 'presentation_page.side_menu.edit.customize.auto_pivot.aria_label'
      : 'presentation_page.side_menu.edit.customize.pivot.aria_label';
  const descriptionKey =
    pivotType === PivotType.Auto
      ? 'presentation_page.side_menu.edit.customize.auto_pivot.description'
      : 'presentation_page.side_menu.edit.customize.pivot.description';
  const iconName =
    pivotType === PivotType.Auto ? 'Sparkles' : 'ArrowCirclepathClockwise';

  return (
    <>
      <ActionItem
        label={t(labelKey)}
        ariaLabel={t(ariaLabelKey)}
        description={t(descriptionKey)}
        onClick={handleClick}
        iconName={iconName}
      />
      <output aria-live="polite" aria-atomic="true" className={classes.srOnly}>
        {statusMessage}
      </output>
    </>
  );
}

export function DrawerEdit() {
  const { isMobile } = useApp();
  const data = useTableData().data;
  const { t } = useTranslation();

  return (
    <ContentBox title={t('presentation_page.side_menu.edit.customize.title')}>
      <div className={classes.operationList}>
        {data && !isMobile && (
          <PivotButton
            stub={data.stub}
            heading={data.heading}
            pivotType={PivotType.Auto}
          />
        )}
        {data && (
          <PivotButton
            stub={data.stub}
            heading={data.heading}
            pivotType={PivotType.Clockwise}
          />
        )}
      </div>
      <Alert variant="info" className={classes.alert}>
        {t('common.status_messages.drawer_edit')}
      </Alert>
    </ContentBox>
  );
}

DrawerEdit.displayName = 'DrawerEdit';
