import type { Meta, StoryObj } from '@storybook/react-vite';

import LineChart from './LineChart';
import { setPxTableData } from '../../Table/Utils/cubeHelper';
import type { PxTable } from '../../../shared-types/pxTable';
import type { DataCell, PxData } from '../../../shared-types/pxTableData';
import type { Variable } from '../../../shared-types/variable';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';

type Story = StoryObj<typeof LineChart>;

function createVariable(
  id: string,
  type: VartypeEnum,
  values: Array<{ code: string; label: string }>,
): Variable {
  return {
    id,
    label: id,
    type,
    mandatory: true,
    values,
  };
}

function createLineChartPxTable(
  years: string[],
  seriesValues: Array<{ code: string; label: string }>,
  getValue: (
    year: string,
    seriesCode: string,
    yearIndex: number,
  ) => number | null,
): PxTable {
  const year = createVariable(
    'year',
    VartypeEnum.TIME_VARIABLE,
    years.map((value) => ({ code: value, label: value })),
  );
  const series = createVariable(
    'series',
    VartypeEnum.REGULAR_VARIABLE,
    seriesValues,
  );
  const contents = createVariable('contents', VartypeEnum.CONTENTS_VARIABLE, [
    {
      code: 'POP',
      label: 'Population',
    },
  ]);

  contents.values[0] = {
    ...contents.values[0],
    contentInfo: {
      unit: 'persons',
      decimals: 0,
      referencePeriod: '',
      basePeriod: '',
      alternativeText: '',
    },
  };

  const cube: PxData<DataCell> = {};
  years.forEach((yearCode, yearIndex) => {
    seriesValues.forEach((seriesValue) => {
      const value = getValue(yearCode, seriesValue.code, yearIndex);
      if (value === null) {
        return;
      }

      setPxTableData(cube, [yearCode, seriesValue.code], {
        value,
      });
    });
  });

  return {
    metadata: {
      id: 'storybook-line-chart',
      language: 'en',
      availableLanguages: ['en'],
      label: 'Population by year',
      updated: new Date('2024-01-01'),
      source: 'Storybook demo source',
      infofile: '',
      decimals: 0,
      officialStatistics: true,
      aggregationAllowed: true,
      contents: 'Population',
      descriptionDefault: true,
      matrix: 'M1',
      subjectCode: 'BE',
      subjectArea: 'Population',
      variables: [year, series, contents],
      contacts: [],
      definitions: {},
      notes: [],
    },
    stub: [year],
    heading: [series],
    data: {
      cube,
      variableOrder: ['year', 'series'],
      isLoaded: true,
    },
  };
}

const defaultPxTable = createLineChartPxTable(
  ['2020', '2021', '2022', '2023', '2024'],
  [
    { code: 'M', label: 'Men' },
    { code: 'F', label: 'Women' },
  ],
  (year, seriesCode) => {
    const baseByYear: Record<string, number> = {
      '2020': 120,
      '2021': 125,
      '2022': 130,
      '2023': 136,
      '2024': 141,
    };

    const base = baseByYear[year] ?? 100;
    return seriesCode === 'M' ? base : base + 6;
  },
);

const manySeriesPxTable = createLineChartPxTable(
  ['2019', '2020', '2021', '2022', '2023', '2024'],
  [
    { code: 'A', label: 'Region A' },
    { code: 'B', label: 'Region B' },
    { code: 'C', label: 'Region C' },
    { code: 'D', label: 'Region D' },
    { code: 'E', label: 'Region E' },
    { code: 'F', label: 'Region F' },
  ],
  (_year, seriesCode, yearIndex) => {
    const seriesOffset: Record<string, number> = {
      A: 20,
      B: 35,
      C: 50,
      D: 65,
      E: 80,
      F: 95,
    };

    return 100 + yearIndex * 8 + (seriesOffset[seriesCode] ?? 0);
  },
);

const sparseDataPxTable = createLineChartPxTable(
  ['2020', '2021', '2022', '2023', '2024'],
  [
    { code: 'Urban', label: 'Urban' },
    { code: 'Rural', label: 'Rural' },
  ],
  (year, seriesCode) => {
    if ((year === '2022' && seriesCode === 'Urban') || year === '2021') {
      return null;
    }

    const valueByYear: Record<string, number> = {
      '2020': 80,
      '2021': 84,
      '2022': 89,
      '2023': 93,
      '2024': 99,
    };

    const base = valueByYear[year] ?? 75;
    return seriesCode === 'Urban' ? base + 10 : base;
  },
);

const meta: Meta<typeof LineChart> = {
  component: LineChart,
  title: 'Components/Chart/LineChart',
  decorators: [
    (StoryComponent) => (
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <StoryComponent />
      </div>
    ),
  ],
};

export default meta;

export const Default: Story = {
  args: {
    pxtable: defaultPxTable,
  },
};

export const CssVariableFallbackColors: Story = {
  args: {
    pxtable: defaultPxTable,
  },
};

export const CustomColors: Story = {
  args: {
    pxtable: defaultPxTable,
    colors: ['#0b5fff', '#fa4d56'],
  },
};

export const EmptyColorsArrayUsesFallback: Story = {
  args: {
    pxtable: defaultPxTable,
    colors: [],
  },
};

export const ManySeries: Story = {
  args: {
    pxtable: manySeriesPxTable,
  },
};

export const SparseData: Story = {
  args: {
    pxtable: sparseDataPxTable,
    colors: ['#24a148', '#8a3ffc'],
  },
};
