import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { DetailsTab } from './DetailsTab';
import { PxTableMetadata } from '@pxweb2/pxweb2-ui';
import { ContentDetails } from './utils';

// Mock the useTranslation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        'presentation_page.main_content.about_table.details.last_updated':
          'Last updated',
        'presentation_page.main_content.about_table.details.next_update':
          'Next update',
        'presentation_page.main_content.about_table.details.source': 'Source',
        'presentation_page.main_content.about_table.details.official_statistics':
          'Official statistics',
        'presentation_page.main_content.about_table.details.unit': 'Unit',
        'presentation_page.main_content.about_table.details.reference_time':
          'Reference time',
        'presentation_page.main_content.about_table.details.base_time':
          'Base time',
        'presentation_page.main_content.about_table.details.update_frequency':
          'Update frequency',
        'presentation_page.main_content.about_table.details.survey': 'Survey',
        'presentation_page.main_content.about_table.details.link': 'Link',
        'presentation_page.main_content.about_table.details.copyright':
          'Copyright',
        'presentation_page.main_content.about_table.details.matrix': 'Matrix',
        'date.simple_date_with_time': 'Date: {{value}}',
      };
      return translations[key] || key;
    },
  }),
}));

const mockTableMetadata: PxTableMetadata = {
  id: '1',
  language: 'en',
  label: 'Test Table',
  infofile: 'Test Infofile',
  updated: new Date(),
  nextUpdate: new Date(),
  source: 'Test Source',
  officialStatistics: false,
  matrix: 'Test Matrix',
  contents: 'Test Contents',
  decimals: 2,
  aggregationAllowed: true,
  descriptionDefault: true,
  subjectCode: 'Test Subject Code',
  subjectArea: 'Test Subject Area',
  updateFrequency: 'Monthly',
  link: 'Test Link',
  survey: 'Test Survey',
  copyright: true,
  variables: [],
  contacts: [],
  notes: [],
};

const mockOnlyMandatoryTableMetadata: PxTableMetadata = {
  id: '1',
  language: 'en',
  label: 'Test Table',
  infofile: 'Test Infofile',
  updated: new Date(),
  source: 'Test Source',
  officialStatistics: false,
  matrix: 'Test Matrix',
  contents: 'Test Contents',
  decimals: 2,
  aggregationAllowed: true,
  descriptionDefault: true,
  subjectCode: 'Test Subject Code',
  subjectArea: 'Test Subject Area',
  variables: [],
  contacts: [],
  notes: [],
};

const basePeriodDetails: ContentDetails[] = [
  { subHeading: 'Base Period 1', text: '2015 BasePeriod' },
  { subHeading: 'Base Period 2', text: ' 2000 BasePeriod2' },
];

const referencePeriodDetails: ContentDetails[] = [
  { subHeading: 'Reference Period 1', text: 'Reference Text 1' },
  { subHeading: 'Reference Period 2', text: 'Reference Text 2' },
];

const unitDetails: ContentDetails[] = [
  { subHeading: 'UnitHeading 1', text: 'UnitText 1' },
  { subHeading: 'UnitHeading 2', text: 'UnitText 2' },
];

vi.mock('./utils', () => ({
  getContentValues: () => [],
  getUnitDetails: () => unitDetails,
  getReferencePeriodDetails: () => referencePeriodDetails,
  getBasePeriodDetails: () => basePeriodDetails,
}));

describe('DetailsTab component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders DetailsTab with mocked baseperiod, reference time and unit', () => {
    render(<DetailsTab tableMetadata={mockTableMetadata} />);
    expect(screen.getByText('Base Period 1')).toBeInTheDocument();
    expect(screen.getByText('2015 BasePeriod')).toBeInTheDocument();
    expect(screen.getByText('Base Period 2')).toBeInTheDocument();
    expect(screen.getByText('2000 BasePeriod2')).toBeInTheDocument();
    expect(screen.getByText('Reference time')).toBeInTheDocument();
    expect(screen.getByText('Reference Period 1')).toBeInTheDocument();
    expect(screen.getByText('Reference Text 1')).toBeInTheDocument();
    expect(screen.getByText('Reference Period 2')).toBeInTheDocument();
    expect(screen.getByText('Reference Text 2')).toBeInTheDocument();
    expect(screen.getByText('Unit')).toBeInTheDocument();
    expect(screen.getByText('UnitHeading 1')).toBeInTheDocument();
    expect(screen.getByText('UnitText 1')).toBeInTheDocument();
    expect(screen.getByText('UnitHeading 2')).toBeInTheDocument();
    expect(screen.getByText('UnitText 2')).toBeInTheDocument();
  });

  it('renders DetailsTab with mocked data', () => {
    render(<DetailsTab tableMetadata={mockTableMetadata} />);
    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.getByText('Next update')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Official statistics')).toBeInTheDocument();
    expect(screen.getByText('Update frequency')).toBeInTheDocument();
    expect(screen.getByText('Matrix')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Link')).toBeInTheDocument();
    expect(screen.getByText('Survey')).toBeInTheDocument();
    expect(screen.getByText('Copyright')).toBeInTheDocument();
  });

  it('renders without optional metadata', () => {
    render(<DetailsTab tableMetadata={mockOnlyMandatoryTableMetadata} />);
    expect(screen.queryByText('Next update')).not.toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Official statistics')).toBeInTheDocument();
    expect(screen.queryByText('Update frequency')).not.toBeInTheDocument();
    expect(screen.getByText('Matrix')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.queryByText('Link')).not.toBeInTheDocument();
    expect(screen.queryByText('Survey')).not.toBeInTheDocument();
    expect(screen.queryByText('Copyright')).not.toBeInTheDocument();
  });
});
