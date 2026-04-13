import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { ActionItem, ContentBox } from '@pxweb2/pxweb2-ui';
import classes from './DrawerView.module.scss';

type ViewMode = 'table' | 'graph';

function getViewMode(searchParams: URLSearchParams): ViewMode {
  return searchParams.get('view') === 'graph' ? 'graph' : 'table';
}

export function DrawerView() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedViewMode = getViewMode(searchParams);

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
            iconName="Table"
            label={t('presentation_page.side_menu.view.table.title')}
            ariaLabel={t('presentation_page.side_menu.view.table.title')}
            onClick={() => setViewMode('table')}
            toggleState={selectedViewMode === 'table'}
          />
        </li>
        <li>
          <ActionItem
            iconName="BarChart"
            label={t('presentation_page.side_menu.view.graph.title')}
            ariaLabel={t('presentation_page.side_menu.view.graph.title')}
            onClick={() => setViewMode('graph')}
            toggleState={selectedViewMode === 'graph'}
          />
        </li>
      </ul>
    </ContentBox>
  );
}

DrawerView.displayName = 'DrawerView';
