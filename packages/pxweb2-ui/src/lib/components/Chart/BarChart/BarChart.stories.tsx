import type { Meta, StoryObj } from '@storybook/react-vite';

import { BarChart } from './BarChart';
import {
  chartStoryArgs,
  createTranslatedChartStory,
} from '../cartesianChartStoryUtils';

const BarChartWithTranslations = createTranslatedChartStory(BarChart);
type Story = StoryObj<typeof BarChartWithTranslations>;

const meta: Meta<typeof BarChartWithTranslations> = {
  component: BarChartWithTranslations,
  title: 'Components/Chart/BarChart',
  decorators: [
    (StoryComponent) => (
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <StoryComponent />
      </div>
    ),
  ],
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
