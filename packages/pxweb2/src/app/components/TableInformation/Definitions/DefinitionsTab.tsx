import cl from 'clsx';

import classes from './DefinitionsTab.module.scss';
import { Definitions } from '@pxweb2/pxweb2-ui';
import { AboutLinks } from './AboutLinks/AboutLinks';
import { Metadata } from './Metadata/Metadata';

interface DefinitionsTabProps {
  readonly definitions: Definitions;
}

export function DefinitionsTab({ definitions }: DefinitionsTabProps) {
  if (!definitions.statisticsHomepage) {
    return null;
  }

  return (
    <div className={cl(classes.definitionsTab)}>
      <AboutLinks
        statisticsHomepage={definitions.statisticsHomepage}
        aboutStatistic={definitions.aboutStatistic}
      />
      <Metadata variablesDefinitions={definitions.variablesDefinitions} />
    </div>
  );
}
