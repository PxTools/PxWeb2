import type { Meta, StoryObj } from '@storybook/react-vite';

import { LineChart } from './LineChart';
import {
  chartStoryArgs,
  chartStoryDecorator,
  createTranslatedChartStory,
} from '../cartesianChartStoryUtils';

const LineChartWithTranslations = createTranslatedChartStory(LineChart);
type Story = StoryObj<typeof LineChartWithTranslations>;

const meta: Meta<typeof LineChartWithTranslations> = {
  component: LineChartWithTranslations,
  title: 'Components/Chart/LineChart',
  decorators: [chartStoryDecorator],
};

export default meta;

export const Default: Story = chartStoryArgs.Default;
export const CssVariableFallbackColors: Story =
  chartStoryArgs.CssVariableFallbackColors;
export const CustomColors: Story = chartStoryArgs.CustomColors;
export const EmptyColorsArrayUsesFallback: Story =
  chartStoryArgs.EmptyColorsArrayUsesFallback;
export const ManySeries: Story = chartStoryArgs.ManySeries;
export const SparseData: Story = chartStoryArgs.SparseData;
export const ManySeriesOnLargeScreen: Story =
  chartStoryArgs.ManySeriesOnLargeScreen;
export const ManySeriesOnSmallScreen: Story =
  chartStoryArgs.ManySeriesOnSmallScreen;
export const LongLegendLabels: Story = chartStoryArgs.LongLegendLabels;
