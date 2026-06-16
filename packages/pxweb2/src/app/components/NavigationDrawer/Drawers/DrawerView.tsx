import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { ActionItem, ContentBox } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../../util/config/getConfig';
import {
  ViewMode,
  getSearchParamsWithViewMode,
  getViewMode,
} from '../../../pages/TableViewer/Utils/tableViewerHelper';
import classes from './DrawerView.module.scss';
export function DrawerView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getConfig();
  const chartEnabled = config.features?.chartEnabled === true;
  const selectedViewMode = getViewMode(searchParams, chartEnabled);
  function setViewMode(viewMode: ViewMode) {
    setSearchParams(getSearchParamsWithViewMode(searchParams, viewMode));
  }

  return (
    <ContentBox>
      <ul className={classes.operationList}>
        <li>
          <ActionItem
            largeIconName="Table"
            size="large"
            label={t('presentation_page.side_menu.view.table.title')}
            ariaLabel={t('presentation_page.side_menu.view.table.title')}
            onClick={() => setViewMode('table')}
            toggleState={selectedViewMode === 'table'}
          />
        </li>
        {chartEnabled && (
          <li>
            <ActionItem
              largeIconName="LineChart"
              size="large"
              label={t('presentation_page.side_menu.view.linechart.title')}
              ariaLabel={t('presentation_page.side_menu.view.linechart.title')}
              onClick={() => setViewMode('linechart')}
              toggleState={selectedViewMode === 'linechart'}
            />
          </li>
        )}
      </ul>
    </ContentBox>
  );
}

DrawerView.displayName = 'DrawerView';
