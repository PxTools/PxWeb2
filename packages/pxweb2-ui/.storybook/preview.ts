import { Preview } from '@storybook/react';

import './../style-dictionary/dist/css/variables.css';
import './../src/lib/global.scss';

const preview: Preview = {
  parameters: {},
  tags: ['autodocs']
};

export default preview;
