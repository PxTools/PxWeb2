import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { ActionItem, ContentBox } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../../util/config/getConfig';
import classes from './DrawerView.module.scss';

type ViewMode = 'table' | 'linechart';
function getViewMode(
  searchParams: URLSearchParams,
  chartEnabled: boolean,
): ViewMode {
  if (!chartEnabled) {
    return 'table';
  }
  return searchParams.get('view') === 'linechart' ? 'linechart' : 'table';
}
export function DrawerView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const config = getConfig();
  const chartEnabled = config.features.chartEnabled;
  const selectedViewMode = getViewMode(searchParams, chartEnabled);
  function setViewMode(viewMode: ViewMode) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('view', viewMode);
    setSearchParams(nextSearchParams);
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
