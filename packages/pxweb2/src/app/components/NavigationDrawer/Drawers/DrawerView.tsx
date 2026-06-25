import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { ActionItem, ContentBox, LocalAlert } from '@pxweb2/pxweb2-ui';
import useTableData from '../../../context/useTableData';
import { getConfig } from '../../../util/config/getConfig';
import {
  ViewMode,
  getSearchParamsWithViewMode,
  getViewMode,
} from '../../../pages/TableViewer/Utils/tableViewerHelper';
import classes from './DrawerView.module.scss';
import useApp from '../../../context/useApp';
export function DrawerView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pivotToMobile, pivotToDesktop, pivotToChart } = useTableData();
  const { isMobile } = useApp();
  const config = getConfig();
  const chartEnabled = config.features?.chartEnabled === true;
  const selectedViewMode = getViewMode(searchParams, chartEnabled);

  function pivotToTable() {
    if (isMobile) {
      pivotToMobile();
    } else {
      pivotToDesktop();
    }
  }

  function setViewMode(viewMode: ViewMode) {
    setSearchParams(getSearchParamsWithViewMode(searchParams, viewMode));
  }

  return (
    <ContentBox>
      {chartEnabled && (
        <ul className={classes.operationList}>
          <li>
            <ActionItem
              largeIconName="Table"
              size="large"
              label={t('presentation_page.side_menu.view.table.title')}
              ariaLabel={t('presentation_page.side_menu.view.table.title')}
              onClick={() => {
                pivotToTable();
                setViewMode('table');
              }}
              toggleState={selectedViewMode === 'table'}
            />
          </li>
          <li>
            <ActionItem
              largeIconName="LineChart"
              size="large"
              label={t('presentation_page.side_menu.view.linechart.title')}
              ariaLabel={t('presentation_page.side_menu.view.linechart.title')}
              onClick={() => {
                pivotToChart();
                setViewMode('linechart');
              }}
              toggleState={selectedViewMode === 'linechart'}
            />
          </li>
        </ul>
      )}
      {!chartEnabled && (
        <LocalAlert variant="info" className={classes.alert}>
          {t('common.status_messages.drawer_view')}
        </LocalAlert>
      )}
    </ContentBox>
  );
}

DrawerView.displayName = 'DrawerView';
