import { Definitions } from '@pxweb2/pxweb2-ui/';
import { DefinitionsTab } from './DefinitionsTab';

const mockDefinitions: Definitions = {
  statisticsHomepage: {
    label: 'Statistics Homepage',
    href: 'https://example.com/statistics-homepage',
    type: 'text/html',
  },
  aboutStatistic: {
    label: 'About the Statistic',
    href: 'https://example.com/about-statistic',
    type: 'text/html',
  },
  variablesDefinitions: [],
};

describe('<DefinitionsTab />', () => {
  it('should render successfully', () => {
    expect(<DefinitionsTab definitions={mockDefinitions} />).toBeTruthy();
  });
});
