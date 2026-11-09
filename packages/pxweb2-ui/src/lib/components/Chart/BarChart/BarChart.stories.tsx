import type { Meta, StoryObj } from '@storybook/react-vite';

import { BarChart } from './BarChart';
import {
  chartStoryArgs,
  chartStoryDecorator,
  createTranslatedChartStory,
} from '../CartesianChart/cartesianChartStoryUtils';

const BarChartWithTranslations = createTranslatedChartStory(BarChart);
type Story = StoryObj<typeof BarChartWithTranslations>;

const meta: Meta<typeof BarChartWithTranslations> = {
  component: BarChartWithTranslations,
  title: 'Components/Chart/BarChart',
  decorators: [chartStoryDecorator],
};

export default meta;

export const Default: Story = chartStoryArgs.Default;
export const CssVariableFallbackColors: Story =
  chartStoryArgs.CssVariableFallbackColors;
export const CustomColors: Story = chartStoryArgs.CustomColors;
export const ManySeriesOnLargeScreen: Story =
  chartStoryArgs.ManySeriesOnLargeScreen;
export const ManySeriesOnSmallScreen: Story =
  chartStoryArgs.ManySeriesOnSmallScreen;
export const LongLegendLabels: Story = chartStoryArgs.LongLegendLabels;
export const EmptyColorsArrayUsesFallback: Story =
  chartStoryArgs.EmptyColorsArrayUsesFallback;
export const ManySeries: Story = chartStoryArgs.ManySeries;
export const SparseData: Story = chartStoryArgs.SparseData;

const horizontalStory = (story: Story): Story => ({
  ...story,
  args: {
    ...story.args,
    orientation: 'horizontal',
  },
});

export const HorizontalDefault: Story = horizontalStory(chartStoryArgs.Default);
export const HorizontalCssVariableFallbackColors: Story = horizontalStory(
  chartStoryArgs.CssVariableFallbackColors,
);
export const HorizontalCustomColors: Story = horizontalStory(
  chartStoryArgs.CustomColors,
);
export const HorizontalManySeriesOnLargeScreen: Story = horizontalStory(
  chartStoryArgs.ManySeriesOnLargeScreen,
);
export const HorizontalManySeriesOnSmallScreen: Story = horizontalStory(
  chartStoryArgs.ManySeriesOnSmallScreen,
);
export const HorizontalLongLegendLabels: Story = horizontalStory(
  chartStoryArgs.LongLegendLabels,
);
export const HorizontalEmptyColorsArrayUsesFallback: Story = horizontalStory(
  chartStoryArgs.EmptyColorsArrayUsesFallback,
);
export const HorizontalManySeries: Story = horizontalStory(
  chartStoryArgs.ManySeries,
);
export const HorizontalSparseData: Story = horizontalStory(
  chartStoryArgs.SparseData,
);
