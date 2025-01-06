import { render } from '@testing-library/react';

import Tabs from './Tabs';
import Tab from './Tab';
import TabPanel from './TabPanel';

describe('Tabs', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <div>
        <Tabs>
          <Tab id="testId" controls="panel" label="test"></Tab>
          <Tab id="testId2" controls="panel2 " label="test2"></Tab>
        </Tabs>
        <TabPanel id="panel" controlledBy="testId1">
          Test
        </TabPanel>
        <TabPanel id="panel2" controlledBy="testId2">
          Test2
        </TabPanel>
      </div>,
    );
    expect(baseElement).toBeTruthy();
  });
});
